'use strict';
'use babel';

const Promise = require('bluebird');
const exec = require('child_process').exec;

const Queue = require('./../queue/Queue');
const Action = require('./../queue/Action');

const ConnectionErrorException = require('./../exceptions/ConnectionErrorException');
const DirectoryCreationErrorException = require('./../exceptions/DirectoryCreationErrorException');
const RemoteDirectoryNotReadableException = require('./../exceptions/RemoteDirectoryNotReadableException');

const MAX_ACTIVE_TRANSFERT = 3;

class Connection
{
    constructor(config) {
        this.config = config ? config : null;
        this.connection = null;
        this.queue = new Queue(MAX_ACTIVE_TRANSFERT);
    }

    // @TODO: Throw a better exception
    getConnectionInformations() {
        throw 'Method non implemented';
    }

    // @TODO: Throw a better exception
    createRemoteDirectory(directoryPath) {
        throw 'Method non implemented';
    }

    // @TODO: Change exec to proper way
    createDirectory(directoryPath) {
        const deferred = Promise.pending();

        try {
            exec(
                `mkdir -p ${directoryPath}`,
                err => {
                    if (err) {
                        return deferred.reject(new DirectoryCreationErrorException(directoryPath));
                    }

                    deferred.resolve(directoryPath);
                }
            );
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    // @TODO: Throw a better exception
    _uploadFile(file) {
        throw 'Method non implemented';
    }

    // @TODO: Throw a better exception
    _downloadFile(file) {
        throw 'Method non implemented';
    }

    connect() {
        const deferred = Promise.pending();

        this.connection.on('ready', () => {
            deferred.resolve(this);
        });

        this.connection.on('error', err => {
            deferred.reject(new ConnectionErrorException(err.message));
        });

        try {
            this.connection.connect(this.getConnectionInformations());
        } catch(e) {
            deferred.reject(new ConnectionErrorException(e.message));
        }

        return deferred.promise;
    }

    close() {
        const deferred = Promise.pending();

        try {
            this.connection.end();
            deferred.resolve(true);
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    upload(files) {
        const deferred = Promise.pending();

        try {
            for (const i in files) {
                this.queue.addAction(new Action(
                    this,
                    this._uploadFile,
                    [ files[i] ]
                ));
            }

            this.queue.execute(
                () => {
                    deferred.resolve(this);
                },
                e => {
                    deferred.reject(e);
                }
            );
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    download(files) {
        const deferred = Promise.pending();

        try {
            for (const i in files) {
                this.queue.addAction(new Action(
                    this,
                    this._downloadFile,
                    [ files[i] ]
                ));
            }

            this.queue.execute(
                () => {
                    deferred.resolve(this);
                },
                e => {
                    deferred.reject(e);
                }
            );
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    extractDistantFiles(node, files) {
        // To implement
    }

    getTargetFiles(nodes) {
        const deferred = Promise.pending();

        const files = [];
        const calls = [];

        try {
            for (const i in nodes) {
                const node = nodes[i];

                calls.push(this.extractDistantFiles(node, files));
            }

            Promise.all(calls)
                .then(() => {
                    deferred.resolve(files);
                })
                .catch(RemoteDirectoryNotReadableException, e => {
                    deferred.reject(e);
                });
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }
}

module.exports = Connection;
