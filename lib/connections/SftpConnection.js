"use babel";

import * as path from "path";
import SshConnection from "ssh2";
import Promise from "bluebird";
import Connection from "./Connection";
import Directory from "./../filesystem/Directory";
import File from "./../filesystem/File";
import UploadErrorException from "./../exceptions/UploadErrorException";
import DownloadErrorException from "./../exceptions/DownloadErrorException";
import RemoteDirectoryCreationErrorException from "./../exceptions/RemoteDirectoryCreationErrorException";
import TransfertErrorException from "./../exceptions/TransfertErrorException";
import RemoteDirectoryNotReadableException from "./../exceptions/RemoteDirectoryNotReadableException";

export default class SftpConnection extends Connection {
  constructor(config) {
    super(config);
    this.connection = new SshConnection();
  }

  getConnectionInformations() {
    var informations = {
      host: this.config.host,
      port: this.config.port ? this.config.port : 22,
      username: this.config.username
    }

    if (this.config.password) {
      informations.password = this.config.password;
    } else {
      informations.privateKey = this.config.sshKeyFile;
      informations.passphrase = this.config.passphrase;
    }

    return informations;
  }

  createRemoteDirectory(sftp, directoryPath) {
    var deferred = Promise.pending();

    var segments = directoryPath.split(/\//g);
    var remote_path = '';

    function mkdirp() {
      if (!segments.length) {
        deferred.resolve(sftp);
      } else {

        var segment = segments.shift();
        segment += '/';

        remote_path = path.join(remote_path, segment);

        sftp.mkdir(remote_path, function(err, stream) {
          if (err && err.code != 4) {
            deferred.reject(new RemoteDirectoryCreationErrorException(directoryPath));
          } else {
            mkdirp();
          }
        });
      }
    }
    sftp.lstat(directoryPath, function(err, stream) {
      if (err) {
        mkdirp();
      } else {
        deferred.resolve(sftp);
      }
    })
    return deferred.promise;
  }

  openSftp() {
    var deferred = Promise.pending();

    try {
      this.connection.sftp(function(err, sftp) {
        if (err) {
          deferred.reject(err);
        }

        deferred.resolve(sftp);
      });
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  fastPut(sftp, sourceFile, destinationFile) {
    var deferred = Promise.pending();

    try {
      sftp.fastPut(sourceFile, destinationFile, function(err) {
        if (err) {
          deferred.reject(new UploadErrorException(sourceFile, err.message));
        }

        deferred.resolve(sftp);
      });
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  fastGet(sftp, sourceFile, destinationFile) {
    var deferred = Promise.pending();

    try {
      sftp.fastGet(sourceFile, destinationFile, function(err) {
        if (err) {
          if (err.code === 'EACCES') {
            deferred.reject(new DownloadErrorException(destinationFile, 'Permission denied'));
          } else {
            deferred.reject(err);
          }
        }

        deferred.resolve(sftp);
      });
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  uploadFile(file) {
    var deferred = Promise.pending();
    var self = this;
    var destinationFile = path.join(
      this.config.remotePath,
      file.getRelativePath()
    ).replace(/\\/g, '/');

    try {
      this.openSftp()
        .then(function(sftp) {
          return self.createRemoteDirectory(sftp, path.dirname(destinationFile));
        })
        .then(function(sftp) {
          return self.fastPut(sftp, file.getPath(), destinationFile);
        })
        .then(function(sftp) {
          sftp.end();
          deferred.resolve(file);
        })
        .catch(function(e) {
          deferred.reject(e);
        });
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  downloadFile(file) {
    var deferred = Promise.pending();
    var self = this;
    var sourceFile = path.join(
      this.config.remotePath,
      file.getRelativePath()
    ).replace(/\\/g, '/');

    try {
      this.createDirectory(file.getDirectory())
        .then(function(directory) {
          return self.openSftp();
        })
        .then(function(sftp) {
          return self.fastGet(sftp, sourceFile, file.getPath());
        })
        .then(function(sftp) {
          sftp.end();
          deferred.resolve(file);
        })
        .catch(function(e) {
          deferred.reject(e);
        });
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  getListDir(sftp, node, files) {
    var deferred = Promise.pending();
    var self = this;

    try {
      if (node instanceof Directory) {
        var remotePath = path.join(
          this.config.remotePath,
          node.getRelativePath()
        ).replace(/\\/g, '/');

        sftp.readdir(remotePath, function(err, nodes) {
          if (err) {
            deferred.reject(new RemoteDirectoryNotReadableException(remotePath));
          }

          var calls = [];

          for (var i in nodes) {
            if (nodes[i].attrs.isDirectory()) {
              calls.push(self.getListDir(sftp, new Directory(path.join(node.getRelativePath(), nodes[i].filename), true), files));
            } else {
              calls.push(self.getListDir(sftp, new File(path.join(node.getRelativePath(), nodes[i].filename), true), files));
            }
          }

          Promise.all(calls)
            .then(function() {
              deferred.resolve();
            })
            .catch(function(e) {
              deferred.reject(e);
            });
        });
      } else {
        files.push(node);
        deferred.resolve();
      }
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  extractDistantFiles(node, files) {
    var deferred = Promise.pending();
    var self = this;

    try {
      var sftp = null;
      if (node instanceof Directory) {
        this.openSftp()
          .then(function(_sftp) {
            sftp = _sftp;
            return self.getListDir(_sftp, node, files);
          })
          .then(function(nodes) {
            sftp.end();
            var calls = [];

            for (var i in nodes) {
              calls.push(this.extractDistantFiles(nodes[i], files));
            }

            Promise.all(calls)
              .then(function() {
                deferred.resolve();
              })
              .catch(function(e) {
                deferred.reject(e);
              });
          })
          .catch(function(e) {
            deferred.reject(e);
          });
      } else {
        files.push(node);
        deferred.resolve();
      }
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }
}

