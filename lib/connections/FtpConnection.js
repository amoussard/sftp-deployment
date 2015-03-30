//////////////////
// Requires
//////////////////

var util = require('util');
var path = require('path');
var fs = require('fs');
var FTPConnection = require('ftp');
var Promise = require('bluebird');

var Connection = require('./Connection');

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


FtpConnection.prototype.createDirectory = function(directoryPath) {
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
        this.get(sourceFile, file.getPath())
            .then(function() {
                deferred.resolve(file);
            });
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

module.exports = FtpConnection;
