//////////////////
// Requires
//////////////////

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

//////////////////
// Ctor
//////////////////

function Config() {
    /**
    * @type {String}
    */
    this.type = undefined;

    /**
    * @type {String}
    */
    this.host = "";

    /**
    * @type {String}
    */
    this.username = "";

    /**
    * @type {String}
    */
    this.password = "";

    /**
    * @type {Number}
    */
    this.port = -1;

    /**
    * @type {String}
    */
    this.remotePath = "";

    /**
    * @type {Bool}
    */
    this.uploadOnSave = false;
}

//////////////////
// Methods
//////////////////

/**
 * Type setter
 * @param {String} _type
 */
Config.prototype.setType = function (_type) {
    this.type = _type;
};

/**
 * Type getter
 */
Config.prototype.getType = function () {
    return this.type;
};

/**
 * Host setter
 * @param {String} _host
 */
Config.prototype.setHost = function (_host) {
    this.host = _host;
};

/**
 * Host getter
 */
Config.prototype.getHost = function () {
    return this.host;
};

/**
 * Username setter
 * @param {String} _username
 */
Config.prototype.setUsername = function (_username) {
    this.username = _username;
};

/**
 * Username getter
 */
Config.prototype.getUsername = function () {
    return this.username;
};

/**
 * Password setter
 * @param {String} _password
 */
Config.prototype.setPassword = function (_password) {
    this.password = _password;
};

/**
 * Password getter
 */
Config.prototype.getPassword = function () {
    return this.password;
};

/**
 * Port setter
 * @param {Number} _port
 */
Config.prototype.setPort = function (_port) {
    this.port = _port;
};

/**
 * Port getter
 */
Config.prototype.getPort = function () {
    return this.port;
};

/**
 * Remote path setter
 * @param {String} _remotePath
 */
Config.prototype.setRemotePath = function (_remotePath) {
    this.remotePath = _remotePath;
};

/**
 * Remote path getter
 */
Config.prototype.getRemotePath = function () {
    return this.remotePath;
};

/**
 * Upload Save setter
 * @param {Bool} _uploadOnSave
 */
Config.prototype.setUploadOnSave = function (_uploadOnSave) {
    this.uploadOnSave = _uploadOnSave;
};

/**
 * Upload Save getter
 */
Config.prototype.getUploadOnSave = function () {
    return this.uploadOnSave;
};

function replacer(key, value) {
    return value !== null ? value : undefined;
}

Config.prototype.save = function (path) {
    return fs.writeFileAsync(path, JSON.stringify(this, replacer, 4));
}

module.exports = Config;
