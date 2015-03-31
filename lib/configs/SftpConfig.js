//////////////////
// Requires
//////////////////

var util = require('util');
var fs = require('fs');
var path = require('path');
var expandHomeDir = require('expand-home-dir')

var Config = require('./Config');

//////////////////
// Ctor
//////////////////

function SftpConfig() {
    Config.apply(this, Array.prototype.slice.call(arguments));

    /**
    * @type {Number}
    */
    this.port = 22;

    /**
    * @type {String}
    */
    this.type = "sftp";

    /**
    * @type {String}
    */
    this.sshKeyFile = null;

    /**
    * @type {String}
    */
    this.passphrase = null;
}

util.inherits(SftpConfig, Config);

//////////////////
// Methods
//////////////////

/**
 * Ssh key file setter
 * @param {String} _key
 */
SftpConfig.prototype.setSshKeyFile = function (_key) {
    this.sshKeyFile = _key;
};

/**
 * Ssh key file getter
 */
SftpConfig.prototype.getSshKeyFile = function () {
    return fs.readFileSync(expandHomeDir(this.sshKeyFile), 'utf8');
};

/**
 * Passphrase setter
 * @param {String} _passphrase
 */
SftpConfig.prototype.setPassphrase = function (_passphrase) {
    this.passphrase = _passphrase;
};

/**
 * Passphrase getter
 */
SftpConfig.prototype.getPassphrase = function () {
    return this.passphrase;
};

module.exports = SftpConfig;
