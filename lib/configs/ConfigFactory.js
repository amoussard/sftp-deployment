//////////////////
// Requires
//////////////////

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var OperationalError = require('bluebird').Promise.OperationalError;

var SftpConfig = require("./SftpConfig");
var FtpConfig = require("./FtpConfig");
var NoConfigurationFileFoundException = require("./../exceptions/NoConfigurationFileFoundException");

//////////////////
// Ctor
//////////////////

function ConfigFactory() {
}

//////////////////
// Methods
//////////////////

ConfigFactory.prototype.parseConfigFile = function(content) {
    var deferred = Promise.pending();

    try {
        var configData = JSON.parse(content);
        deferred.fulfill(configData);
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

ConfigFactory.prototype.createConfig = function(configData) {
    var deferred = Promise.pending();

    try {
        var type = configData.type;
        type = type.charAt(0).toUpperCase() + type.substring(1);
        var getter = 'create' + type + 'Config';
        var config = this[getter]();

        for (var key in configData) {
            if (config[key] !== undefined) {
                config[key] = configData[key];
            }
        }
        deferred.resolve(config);
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
}

/**
 * Create configuration from a file
 * @param {String}   file
 * @param {Function} callback
 */
ConfigFactory.prototype.loadConfig = function(configPath) {
    var deferred = Promise.pending();
    var config = null;
    var self = this;

    return fs.readFileAsync(configPath, 'utf8')
        .then(function(content) {
            return self.parseConfigFile(content);
        })
        .then(function(configData) {
            return self.createConfig(configData);
        })
        .catch(OperationalError, function(e) {
            if (e.code === 'ENOENT') {
                throw new NoConfigurationFileFoundException();
            }
        });
};

/**
 * @return {SftpConfig}
 */
ConfigFactory.prototype.createSftpConfig = function () {
    return new SftpConfig();
};

/**
 * @return {FtpConfig}
 */
ConfigFactory.prototype.createFtpConfig = function () {
    return new FtpConfig();
};

module.exports = ConfigFactory;
