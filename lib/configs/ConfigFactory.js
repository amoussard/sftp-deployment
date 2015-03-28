//////////////////
// Requires
//////////////////

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var SftpConfig = require("./SftpConfig");
var FtpConfig = require("./FtpConfig");

var self;

//////////////////
// Ctor
//////////////////

function ConfigFactory() {
  self = this;
}

util.inherits(ConfigFactory, EventEmitter);

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
        var config = self[getter]();
        deferred.resolve(config, configData);
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
ConfigFactory.prototype.loadConfig = function(configPath, callback) {
    var deferred = Promise.pending();
    var config = null;

    return fs.readFileAsync(configPath, 'utf8')
        .then(function(content) {
            return self.parseConfigFile(content);
        })
        .then(function(configData) {
            return self.createConfig(configData);
        })
        .then(function(config, configData) {
            console.log(config);
            console.log(configData);
            exit();
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
