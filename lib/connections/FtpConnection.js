"use babel";

import * as path from "path";
import * as fs from "fs";
import FTPConnection from "ftp";
import Promise from "bluebird";
import Connection from "./Connection";
import Directory from "./../filesystem/Directory";
import File from "./../filesystem/File";
import UploadErrorException from "./../exceptions/UploadErrorException";
import DownloadErrorException from "./../exceptions/DownloadErrorException";
import RemoteDirectoryCreationErrorException from "./../exceptions/RemoteDirectoryCreationErrorException";
import TransfertErrorException from "./../exceptions/TransfertErrorException";
import RemoteDirectoryNotReadableException from "./../exceptions/RemoteDirectoryNotReadableException";

export default class FtpConnection extends Connection {
  constructor(config) {
    super(config)
    this.connection = new FTPConnection();
  }

  getConnectionInformations() {
    var self = this;

    return {
      host: self.config.host,
      port: self.config.port ? self.config.port : 21,
      user: self.config.username,
      password: self.config.password
    };
  }


  createRemoteDirectory(directoryPath) {
    var deferred = Promise.pending();

    try {
      this.connection.mkdir(
        directoryPath,
        true,
        (err) => {
          if (err) {
            deferred.reject(new RemoteDirectoryCreationErrorException(directoryPath));
          }

          deferred.resolve(directoryPath);
        }
      );
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  put(sourceFile, destinationFile) {
    var deferred = Promise.pending();

    try {
      this.connection.put(sourceFile, destinationFile, (err) => {
        if (err) {
          if (err.code === 550) {
            deferred.reject(new UploadErrorException(sourceFile, 'Permission denied'));
          } else {
            deferred.reject(err);
          }
          return;
        }

        deferred.resolve();
      });
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  get(sourceFile, destinationFile) {
    var deferred = Promise.pending();

    try {
      this.connection.get(sourceFile, (err, stream) => {
        if (err) {
          if (err.code === 550) {
            deferred.reject(new DownloadErrorException(destinationFile, 'Permission denied'));
          } else if (err.code === 425) {
            deferred.reject(new TransfertErrorException(sourceFile, err.message));
          } else {
            deferred.reject(err);
          }
          return;
        }

        var outFileStream = fs.createWriteStream(destinationFile);
        outFileStream.once('error', (e) => {
          deferred.reject(new DownloadErrorException(destinationFile, 'Permission denied'));
        });
        stream.once('close', () => {
          deferred.resolve();
        });
        stream.pipe(outFileStream);
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
      this.config.getRemotePath(),
      file.getRelativePath()
    ).replace(/\\/g, '/');

    try {
      this.createRemoteDirectory(path.dirname(destinationFile))
        .then((directory) => {
          return self.put(file.getPath(), destinationFile);
        })
        .then(() => {
          deferred.resolve(file);
        })
        .catch((e) => {
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
      this.config.getRemotePath(),
      file.getRelativePath()
    ).replace(/\\/g, '/');

    try {
      this.createDirectory(file.getDirectory())
        .then((directory) => {
          return self.get(sourceFile, file.getPath());
        })
        .then(() => {
          deferred.resolve(file);
        })
        .catch((e) => {
          deferred.reject(e);
        });
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  extractDistantFiles(node, files) {
    var deferred = Promise.pending();
    var self = this;

    try {
      if (node instanceof Directory) {
        var remotePath = path.join(
          this.config.getRemotePath(),
          node.getRelativePath()
        ).replace(/\\/g, '/');

        this.connection.list(remotePath, (err, nodes) => {
          if (err) {
            deferred.reject(new RemoteDirectoryNotReadableException(remotePath));
          }

          var calls = [];

          for (var i in nodes) {
            if (nodes[i].type === 'd') {
              calls.push(self.extractDistantFiles(new Directory(path.join(node.getRelativePath(), nodes[i].name), true), files));
            } else {
              calls.push(self.extractDistantFiles(new File(path.join(node.getRelativePath(), nodes[i].name), true), files));
            }
          }

          Promise.all(calls).then(() => {
            deferred.resolve();
          })
            .catch((e) => {
              deferred.reject(e);
            });
        })
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

