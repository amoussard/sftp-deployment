//////////////////
// Requires
//////////////////

var Promise = require('bluebird');
var util = require('util');
var path = require('path');
var SshConnection = require('ssh2');

var Connection = require('./Connection');

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

    return {
        host: self.config.host,
        port: self.config.port ? self.config.port : 22,
        username: self.config.username,
        password: self.config.password
    };
}

SftpConnection.prototype.createDirectory = function(directoryPath) {
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
    );

    try {
        this.createDirectory(path.dirname(destinationFile))
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
    );

    try {
        this.openSftp()
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

module.exports = SftpConnection;
