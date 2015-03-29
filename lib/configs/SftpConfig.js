//////////////////
// Requires
//////////////////

var Config = require('./Config');
var util = require('util');

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
  this.sshKeyFile = "";
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
    return this.sshKeyFile;
};

module.exports = SftpConfig;
