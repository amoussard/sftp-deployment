//////////////////
// Requires
//////////////////

var Promise = require('bluebird');
var util = require('util');
var path = require('path');
var SshConnection = require('ssh2');

var Connection = require('./Connection');
var Directory = require('./../filesystem/Directory');
var File = require('./../filesystem/File');

//////////////////
// Ctor
//////////////////

function SftpConnection(config) {
    Connection.apply(this, [config]);

    this.connection = new SshConnection();
}

util.inherits(SftpConnection, Connection);

//////////////////
// Methods
//////////////////

SftpConnection.prototype.getConnectionInformations = function() {
    var self = this;

    var informations = {
        host: self.config.host,
        port: self.config.port ? self.config.port : 22,
        username: self.config.getUsername()
    }

    if (self.config.getPassword()) {
        informations.password = self.config.getPassword();
    } else {
        informations.privateKey = self.config.getSshKeyFile();
        informations.passphrase = self.config.getPassphrase();
    }

    return informations;
}

SftpConnection.prototype.createRemoteDirectory = function(directoryPath) {
    var deferred = Promise.pending();

    try {
        this.connection.exec(
            'mkdir -p ' + directoryPath,
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

SftpConnection.prototype.openSftp = function() {
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

SftpConnection.prototype.fastPut = function(sftp, sourceFile, destinationFile) {
    var deferred = Promise.pending();

    try {
        sftp.fastPut(sourceFile, destinationFile, function(err) {
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

SftpConnection.prototype.fastGet = function(sftp, sourceFile, destinationFile) {
    var deferred = Promise.pending();

    try {
        sftp.fastGet(sourceFile, destinationFile, function(err) {
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

SftpConnection.prototype.uploadFile = function(file) {
    var deferred = Promise.pending();
    var self = this;
    var destinationFile = path.join(
        this.config.getRemotePath(),
        file.getRelativePath()
    ).replace(/\\/g, '/');

    try {
        this.createRemoteDirectory(path.dirname(destinationFile))
            .then(function(directory) {
                return self.openSftp();
            })
            .then(function(sftp) {
                return self.fastPut(sftp, file.getPath(), destinationFile);
            })
            .then(function(sftp) {
                sftp.end();
                deferred.resolve(file);
            });
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

SftpConnection.prototype.downloadFile = function(file) {
    var deferred = Promise.pending();
    var self = this;
    var sourceFile = path.join(
        this.config.getRemotePath(),
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
            });
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

SftpConnection.prototype.getListDir = function(sftp, node, files) {
    var deferred = Promise.pending();
    var self = this;

    try {
        if (node instanceof Directory) {
            var remotePath = path.join(
                this.config.getRemotePath(),
                node.getRelativePath()
            ).replace(/\\/g, '/');

            sftp.readdir(remotePath, function(err, nodes) {
                if (err) {
                    deferred.reject(err);
                }

                var calls = [];

                for (var i in nodes) {
                    if (nodes[i].attrs.isDirectory()) {
                        calls.push(self.getListDir(sftp, new Directory(path.join(node.getRelativePath(), nodes[i].filename), true), files));
                    } else {
                        calls.push(self.getListDir(sftp, new File(path.join(node.getRelativePath(), nodes[i].filename), true), files));
                    }
                }

                Promise.all(calls).then(function() {
                    deferred.resolve();
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

SftpConnection.prototype.extractDistantFiles = function(node, files) {
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

                    Promise.all(calls).then(function() {
                        deferred.resolve();
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

module.exports = SftpConnection;
