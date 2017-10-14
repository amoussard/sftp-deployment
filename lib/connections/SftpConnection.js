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
import RemoteDirectoryNotReadableException from "./../exceptions/RemoteDirectoryNotReadableException";

export default class SftpConnection extends Connection {
  constructor(config) {
    super(config);
    this.connection = new SshConnection();
  }

  getConnectionInformations() {
    const informations = {
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
    const deferred = Promise.pending();

    const segments = directoryPath.split(/\//g);
    let remotePath = "";

    function mkdirp() {
      if (!segments.length) {
        deferred.resolve(sftp);
      } else {

        let segment = segments.shift();

        segment += "/";

        remotePath = path.join(remotePath, segment);

        sftp.mkdir(remotePath, (err) => {
          if (err && err.code !== 4) {
            deferred.reject(new RemoteDirectoryCreationErrorException(directoryPath));
          } else {
            mkdirp();
          }
        });
      }
    }
    sftp.lstat(directoryPath, (err) => {
      if (err) {
        mkdirp();
      } else {
        deferred.resolve(sftp);
      }
    })

    return deferred.promise;
  }

  openSftp() {
    const deferred = Promise.pending();

    try {
      this.connection.sftp((err, sftp) => {
        if (err) {
          deferred.reject(err);
        }

        deferred.resolve(sftp);
      });
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  fastPut(sftp, sourceFile, destinationFile) {
    const deferred = Promise.pending();

    try {
      sftp.fastPut(sourceFile, destinationFile, (err) => {
        if (err) {
          deferred.reject(new UploadErrorException(sourceFile, err.message));
        }

        deferred.resolve(sftp);
      });
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  fastGet(sftp, sourceFile, destinationFile) {
    const deferred = Promise.pending();

    try {
      sftp.fastGet(sourceFile, destinationFile, (err) => {
        if (err) {
          if (err.code === "EACCES") {
            deferred.reject(new DownloadErrorException(destinationFile, "Permission denied"));
          } else {
            deferred.reject(err);
          }
        }

        deferred.resolve(sftp);
      });
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  uploadFile(file) {
    const deferred = Promise.pending();
    const destinationFile = path.join(
      this.config.remotePath,
      file.getRelativePath()
    ).replace(/\\/g, "/");

    try {
      this.openSftp()
        .then((sftp) => this.createRemoteDirectory(sftp, path.dirname(destinationFile)))
        .then((sftp) => this.fastPut(sftp, file.getPath(), destinationFile))
        .then((sftp) => {
          sftp.end();
          deferred.resolve(file);
        })
        .catch((e) => {
          deferred.reject(e);
        });
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  downloadFile(file) {
    const deferred = Promise.pending();
    const sourceFile = path.join(
      this.config.remotePath,
      file.getRelativePath()
    ).replace(/\\/g, "/");

    try {
      this.createDirectory(file.getDirectory())
        .then(() => this.openSftp())
        .then((sftp) => this.fastGet(sftp, sourceFile, file.getPath()))
        .then((sftp) => {
          sftp.end();
          deferred.resolve(file);
        })
        .catch((e) => {
          deferred.reject(e);
        });
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  getListDir(sftp, node, files) {
    const deferred = Promise.pending();

    try {
      if (node instanceof Directory) {
        const remotePath = path.join(
          this.config.remotePath,
          node.getRelativePath()
        ).replace(/\\/g, "/");

        sftp.readdir(remotePath, (err, nodes) => {
          if (err) {
            deferred.reject(new RemoteDirectoryNotReadableException(remotePath));
          }

          const calls = [];

          for (const i in nodes) {
            if (nodes[i].attrs.isDirectory()) {
              const directory = new Directory(path.join(node.getRelativePath(), nodes[i].filename), true);

              calls.push(this.getListDir(sftp, directory, files));
            } else {
              const file = new File(path.join(node.getRelativePath(), nodes[i].filename), true);

              calls.push(this.getListDir(sftp, file, files));
            }
          }

          Promise.all(calls)
            .then(() => {
              deferred.resolve();
            })
            .catch((e) => {
              deferred.reject(e);
            });
        });
      } else {
        files.push(node);
        deferred.resolve();
      }
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  extractDistantFiles(node, files) {
    const deferred = Promise.pending();

    try {
      let sftp = null;

      if (node instanceof Directory) {
        this.openSftp()
          .then((_sftp) => {
            sftp = _sftp;

            return this.getListDir(_sftp, node, files);
          })
          .then((nodes) => {
            sftp.end();
            const calls = nodes.map((n) => calls.push(this.extractDistantFiles(n, files)));

            Promise.all(calls)
              .then(() => {
                deferred.resolve();
              })
              .catch((e) => {
                deferred.reject(e);
              });
          })
          .catch((e) => {
            deferred.reject(e);
          });
      } else {
        files.push(node);
        deferred.resolve();
      }
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }
}

