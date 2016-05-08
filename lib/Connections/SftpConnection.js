'use strict';
'use babel';

const Promise = require('bluebird');
const path = require('path');
const SshConnection = require('ssh2');

const Connection = require('./Connection');
const Directory = require('././Directory');
const File = require('././File');

const UploadErrorException = require('././UploadErrorException');
const DownloadErrorException = require('././DownloadErrorException');
const RemoteDirectoryCreationErrorException = require('././RemoteDirectoryCreationErrorException');
const RemoteSystemErrorException = require('././RemoteSystemErrorException');
const RemoteDirectoryNotReadableException = require('././RemoteDirectoryNotReadableException');

const DEFAULT_SSH_PORT = 22;

class SftpConnection extends Connection
{
    constructor(config) {
        super(config);

        this.connection = new SshConnection();
    }

    getConnectionInformations() {
        const informations = {
            host: this.config.host,
            port: this.config.port ? this.config.port : DEFAULT_SSH_PORT,
            username: this.config.getUsername()
        };

        if (this.config.getPassword()) {
            informations.password = this.config.getPassword();
        } else {
            informations.privateKey = this.config.getSshKeyFile();
            informations.passphrase = this.config.getPassphrase();
        }

        return informations;
    }

    createRemoteDirectory(directoryPath) {
        const deferred = Promise.pending();

        try {
            this.connection.exec(
                `mkdir -p ${directoryPath}`,
                (err, stream) => {
                    if (err) {
                        deferred.reject(new RemoteDirectoryCreationErrorException(directoryPath));
                    }

                    stream.on('close', () => {
                        deferred.resolve(directoryPath);
                    });
                    stream.stderr.on('data', data => {
                        deferred.reject(new RemoteSystemErrorException(data.toString()));
                    });
                }
            );
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    _openSftp() {
        const deferred = Promise.pending();

        try {
            this.connection.sftp((err, sftp) => {
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

    _fastPut(sftp, sourceFile, destinationFile) {
        const deferred = Promise.pending();

        try {
            sftp.fastPut(sourceFile, destinationFile, err => {
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

    _fastGet(sftp, sourceFile, destinationFile) {
        const deferred = Promise.pending();

        try {
            sftp.fastGet(sourceFile, destinationFile, err => {
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
        const deferred = Promise.pending();
        const destinationFile = path.join(
            this.config.getRemotePath(),
            file.getRelativePath()
        ).replace(/\\/g, '/');

        try {
            return this.createRemoteDirectory(path.dirname(destinationFile))
                .then(() => {
                    return this._openSftp();
                })
                .then(sftp => {
                    return this._fastPut(sftp, file.getPath(), destinationFile);
                })
                .then(sftp => {
                    sftp.end();

                    return file;
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
            return this.createDirectory(file.getDirectory())
                .then(() => {
                    return this._openSftp();
                })
                .then(sftp => {
                    return this._fastGet(sftp, sourceFile, file.getPath());
                })
                .then(sftp => {
                    sftp.end();

                    return file;
                })
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    _getListDir(sftp, node, files) {
        const deferred = Promise.pending();

        try {
            if (node instanceof Directory) {
                const remotePath = path.join(
                    this.config.getRemotePath(),
                    node.getRelativePath()
                ).replace(/\\/g, '/');

                sftp.readdir(remotePath, (err, nodes) => {
                    if (err) {
                        deferred.reject(new RemoteDirectoryNotReadableException(remotePath));
                    }

                    const calls = [];

                    for (const i in nodes) {
                        if (nodes[i].attrs.isDirectory()) {
                            calls.push(this._getListDir(
                                sftp,
                                new Directory(path.join(node.getRelativePath(), nodes[i].filename), true),
                                files
                            ));
                        } else {
                            calls.push(this._getListDir(
                                sftp,
                                new File(path.join(node.getRelativePath(), nodes[i].filename), true),
                                files
                            ));
                        }
                    }

                    return Promise.all(calls)
                        .then(() => {
                            deferred.resolve();
                        })
                        .catch(e => {
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
        const deferred = Promise.pending();

        try {
            let sftp = null;

            if (node instanceof Directory) {
                this._openSftp()
                    .then(_sftp => {
                        sftp = _sftp;

                        return this._getListDir(_sftp, node, files);
                    })
                    .then(function(nodes) {
                        sftp.end();
                        const calls = [];

                        for (const i in nodes) {
                            calls.push(this.extractDistantFiles(nodes[i], files));
                        }

                        Promise.all(calls)
                            .then(() => {
                                deferred.resolve();
                            })
                            .catch(e => {
                                deferred.reject(e);
                            });
                    })
                    .catch(e => {
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

module.exports = SftpConnection;
