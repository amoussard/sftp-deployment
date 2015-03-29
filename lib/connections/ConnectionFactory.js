//////////////////
// Requires
//////////////////

var Promise = require('bluebird');

var SftpConnection = require("./SftpConnection");
var FtpConnection = require("./FtpConnection");

//////////////////
// Ctor
//////////////////

function ConnectionFactory() {
}

//////////////////
// Methods
//////////////////

ConnectionFactory.prototype.createConnection = function(config) {
    var deferred = Promise.pending();

    try {
        var type = config.type;
        type = type.charAt(0).toUpperCase() + type.substring(1);
        var getter = 'create' + type + 'Connection';
        var connection = this[getter](config);

        deferred.resolve(connection);
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
};

/**
 * @return {SftpConnection}
 */
ConnectionFactory.prototype.openConnection = function (config) {
    return this.createConnection(config)
        .then(function(connection) {
            return connection.connect();
        });
};

/**
 * @return {SftpConnection}
 */
ConnectionFactory.prototype.createSftpConnection = function (config) {
    return new SftpConnection(config);
};

/**
 * @return {FtpConnection}
 */
ConnectionFactory.prototype.createFtpConnection = function (config) {
    return new FtpConnection(config);
};

module.exports = ConnectionFactory;
