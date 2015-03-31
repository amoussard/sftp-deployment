//////////////////
// Requires
//////////////////

var util = require('util');
var path = require('path');
var fs = require('fs');
var FTPConnection = require('ftp');
var Promise = require('bluebird');

var Connection = require('./Connection');
var Directory = require('./../filesystem/Directory');
var File = require('./../filesystem/File');

//////////////////
// Ctor
//////////////////

function FtpConnection(config) {
    Connection.apply(this, [config]);

    this.connection = new FTPConnection();
}

util.inherits(FtpConnection, Connection);

//////////////////
// Methods
//////////////////

FtpConnection.prototype.getConnectionInformations = function() {
    var self = this;

    return {
        host: self.config.host,
        port: self.config.port ? self.config.port : 21,
        user: self.config.username,
        password: self.config.password
    };
}


FtpConnection.prototype.createRemoteDirectory = function(directoryPath) {
    var deferred = Promise.pending();

    try {
        this.connection.mkdir(
            directoryPath,
            true,
            function (err) {
                if (err) {
                    deferred.reject(err);
                }

                deferred.resolve(directoryPath);
            }
        );
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

FtpConnection.prototype.put = function(sourceFile, destinationFile) {
    var deferred = Promise.pending();

    try {
        this.connection.put(sourceFile, destinationFile, function(err) {
            if (err) {
                deferred.reject(err);
            }

            deferred.resolve();
        });
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

FtpConnection.prototype.get = function(sourceFile, destinationFile) {
    var deferred = Promise.pending();

    try {
        this.connection.get(sourceFile, function(err, stream) {
            if (err) {
                deferred.reject(err);
                return;
            }

            stream.once('close', function() {
                deferred.resolve();
            });
            stream.pipe(fs.createWriteStream(destinationFile));
        });
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

FtpConnection.prototype.uploadFile = function(file) {
    var deferred = Promise.pending();
    var self = this;
    var destinationFile = path.join(
        this.config.getRemotePath(),
        file.getRelativePath()
    ).replace(/\\/g, '/');

    try {
        this.createDirectory(path.dirname(destinationFile))
            .then(function(directory) {
                return self.put(file.getPath(), destinationFile);
            })
            .then(function() {
                deferred.resolve(file);
            });
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

FtpConnection.prototype.downloadFile = function(file) {
    var deferred = Promise.pending();
    var self = this;
    var sourceFile = path.join(
        this.config.getRemotePath(),
        file.getRelativePath()
    ).replace(/\\/g, '/');

    try {
        this.createDirectory(file.getDirectory())
            .then(function(directory) {
                return self.get(sourceFile, file.getPath());
            })
            .then(function() {
                deferred.resolve(file);
            });
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

FtpConnection.prototype.extractDistantFiles = function(node, files) {
    var deferred = Promise.pending();
    var self = this;

    try {
        if (node instanceof Directory) {
            var remotePath = path.join(
                this.config.getRemotePath(),
                node.getRelativePath()
            ).replace(/\\/g, '/');

            this.connection.list(remotePath, function(err, nodes) {
                if (err) {
                    deferred.reject(err);
                }

                var calls = [];

                for (var i in nodes) {
                    if (nodes[i].type === 'd') {
                        calls.push(self.extractDistantFiles(new Directory(path.join(node.getRelativePath(), nodes[i].name), true), files));
                    } else {
                        calls.push(self.extractDistantFiles(new File(path.join(node.getRelativePath(), nodes[i].name), true), files));
                    }
                }

                Promise.all(calls).then(function() {
                    deferred.resolve();
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

module.exports = FtpConnection;
