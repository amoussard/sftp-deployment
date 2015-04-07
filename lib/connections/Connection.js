//////////////////
// Requires
//////////////////

var Promise = require('bluebird');
var exec = require('child_process').exec;

var Queue = require('./../queue/Queue');
var Action = require('./../queue/Action');
var Directory = require('./../filesystem/Directory');

var ConnectionErrorException = require('./../exceptions/ConnectionErrorException');
var DirectoryCreationErrorException = require('./../exceptions/DirectoryCreationErrorException');
var RemoteDirectoryNotReadableException = require('./../exceptions/RemoteDirectoryNotReadableException');

//////////////////
// Ctor
//////////////////

function Connection(config) {
    this.config = config ? config : null;
    this.connection = null;
    this.queue = new Queue(3);
}

//////////////////
// Methods
//////////////////

Connection.prototype.getConnectionInformations = function() {
    throw "Method non implemented";
}

Connection.prototype.createRemoteDirectory = function(directoryPath) {
    throw "Method non implemented";
}

/**
 * @TODO: Change exec to proper way
 */
 Connection.prototype.createDirectory = function(directoryPath) {
    var deferred = Promise.pending();

    try {
        exec(
            'mkdir -p ' + directoryPath,
            function (err) {
                if (err) {
                    deferred.reject(new DirectoryCreationErrorException(directoryPath));
                    return;
                }

                deferred.resolve(directoryPath);
            }
        );
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

Connection.prototype.uploadFile = function(file) {
    throw "Method non implemented";
}

Connection.prototype.downloadFile = function(file) {
    throw "Method non implemented";
}

Connection.prototype.connect = function() {
    var self = this;
    var deferred = Promise.pending();

    this.connection.on('ready', function() {
        deferred.resolve(self);
    });

    this.connection.on('error', function(err) {
        deferred.reject(new ConnectionErrorException(err.message));
    });

    try {
        this.connection.connect(this.getConnectionInformations());
    } catch(e) {
        deferred.reject(new ConnectionErrorException(e.message));
    }

    return deferred.promise;
}

Connection.prototype.close = function() {
    var deferred = Promise.pending();

    try {
        this.connection.end();
        deferred.resolve(true);
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

/**
 * @param  {File[]} files
 */
 Connection.prototype.upload = function(files) {
    var self = this;
    var deferred = Promise.pending();

    try {
        for (var i in files) {
            this.queue.addAction(new Action(
                self,
                self.uploadFile,
                [files[i]]
            ));
        }

        this.queue.execute(
            function() {
                deferred.resolve(self);
            },
            function(e) {
                deferred.reject(e);
            }
        );
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

/**
 * @param  {File[]} aFiles
 */
 Connection.prototype.download = function(files) {
    var self = this;
    var deferred = Promise.pending();

    try {
        for (var i in files) {
            this.queue.addAction(new Action(
                self,
                self.downloadFile,
                [files[i]]
            ));
        }

        this.queue.execute(
            function() {
                deferred.resolve(self);
            },
            function(e) {
                deferred.reject(e);
            }
        );
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

Connection.prototype.extractDistantFiles = function(node, files) {
}

/**
 * @param  {File[]} aFiles
 */
 Connection.prototype.getTargetFiles = function(nodes) {
    var self = this;
    var deferred = Promise.pending();

    var files = [];
    var calls = [];

    try {
        for (var i in nodes) {
            var node = nodes[i];
            calls.push(this.extractDistantFiles(node, files));
        }

        Promise.all(calls)
            .then(function() {
                deferred.resolve(files);
            })
            .catch(RemoteDirectoryNotReadableException, function(e) {
                deferred.reject(e);
            });
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

module.exports = Connection;
