//////////////////
// Requires
//////////////////

var Config = require('./Config');
var util = require('util');

var self;

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
  this.key = "facultative : set to empty if not used";

  self = this;
}

util.inherits(SftpConfig, Config);

//////////////////
// Methods
//////////////////

/**
 * Key setter
 * @param {String} _key
 */
SftpConfig.prototype.setKey = function (_key) {
  self.key = _key;
};

/**
 * Key getter
 */
SftpConfig.prototype.getKey = function () {
  return self.key;
};

SftpConfig.prototype.getConnectionInformations = function () {
  var informations = {
    type: self.getType(),
    host: self.getHost(),
    username: self.getUsername(),
    password: self.getPassword(),
    port: self.getPort(),
    destinationFolder: self.getDestinationFolder(),
    key: self.getKey()
  };
  return informations;
};

module.exports = SftpConfig;
