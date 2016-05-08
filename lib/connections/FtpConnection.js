'use strict';
'use babel';

const path = require('path');
const fs = require('fs');
const FTPConnection = require('ftp');
const Promise = require('bluebird');

const Connection = require('./Connection');
const Directory = require('././Directory');
const File = require('././File');

const UploadErrorException = require('././UploadErrorException');
const DownloadErrorException = require('././DownloadErrorException');
const RemoteDirectoryCreationErrorException = require('././RemoteDirectoryCreationErrorException');
const TransfertErrorException = require('././TransfertErrorException');
const RemoteDirectoryNotReadableException = require('././RemoteDirectoryNotReadableException');

const DEFAULT_FTP_PORT = 21;

const ERROR_CODE_PERMISSION_DENIED = 550;
const ERROR_CODE_TRANSFERT_ERROR = 425;

class FtpConnection extends Connection
{
    constructor(config) {
        super(config);

        this.connection = new FTPConnection();
    }

    getConnectionInformations() {
        return {
            host: this.config.host,
            port: this.config.port ? this.config.port : DEFAULT_FTP_PORT,
            user: this.config.username,
            password: this.config.password
        };
    }

    createRemoteDirectory(directoryPath) {
        const deferred = Promise.pending();

        try {
            this.connection.mkdir(
                directoryPath,
                true,
                err => {
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

    _put(sourceFile, destinationFile) {
        const deferred = Promise.pending();

        try {
            this.connection.put(sourceFile, destinationFile, err => {
                if (err) {
                    if (err.code === ERROR_CODE_PERMISSION_DENIED) {
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

    _get(sourceFile, destinationFile) {
        const deferred = Promise.pending();

        try {
            this.connection.get(sourceFile, (err, stream) => {
                if (err) {
                    if (err.code === ERROR_CODE_PERMISSION_DENIED) {
                        deferred.reject(new DownloadErrorException(destinationFile, 'Permission denied'));
                    } else if (err.code === ERROR_CODE_TRANSFERT_ERROR) {
                        deferred.reject(new TransfertErrorException(sourceFile, err.message));
                    } else {
                        deferred.reject(err);
                    }

                    return;
                }

                const outFileStream = fs.createWriteStream(destinationFile);

                outFileStream.once('error', () => {
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
        const deferred = Promise.pending();
        const destinationFile = path.join(
            this.config.getRemotePath(),
            file.getRelativePath()
        ).replace(/\\/g, '/');

        try {
            this.createRemoteDirectory(path.dirname(destinationFile))
                .then(() => {
                    return this._put(file.getPath(), destinationFile);
                })
                .then(() => {
                    deferred.resolve(file);
                })
                .catch(e => {
                    deferred.reject(e);
                });
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    downloadFile(file) {
        const deferred = Promise.pending();
        const sourceFile = path.join(
            this.config.getRemotePath(),
            file.getRelativePath()
        ).replace(/\\/g, '/');

        try {
            this.createDirectory(file.getDirectory())
                .then(() => {
                    return this._get(sourceFile, file.getPath());
                })
                .then(() => {
                    deferred.resolve(file);
                })
                .catch(e => {
                    deferred.reject(e);
                });
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    extractDistantFiles(node, files) {
        const deferred = Promise.pending();

        try {
            if (node instanceof Directory) {
                const remotePath = path.join(
                    this.config.getRemotePath(),
                    node.getRelativePath()
                ).replace(/\\/g, '/');

                this.connection.list(remotePath, (err, nodes) => {
                    if (err) {
                        deferred.reject(new RemoteDirectoryNotReadableException(remotePath));
                    }

                    const calls = [];

                    for (const i in nodes) {
                        if (nodes[i].type === 'd') {
                            calls.push(this.extractDistantFiles(
                                new Directory(path.join(node.getRelativePath(), nodes[i].name), true),
                                files
                            ));
                        } else {
                            calls.push(this.extractDistantFiles(
                                new File(path.join(node.getRelativePath(), nodes[i].name), true),
                                files
                            ));
                        }
                    }

                    Promise.all(calls).then(() => {
                        deferred.resolve();
                    })
                    .catch(e => {
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

module.exports = FtpConnection;
