//////////////////
// Requires
//////////////////

var Config = require('./Config');
var util = require('util');

var self;

//////////////////
// Ctor
//////////////////

function FtpConfig() {
  Config.apply(this, Array.prototype.slice.call(arguments));

  /**
   * @type {Number}
   */
  this.port = 21;

  /**
   * @type {String}
   */
  this.type = "ftp";

  self = this;
}

util.inherits(FtpConfig, Config);

//////////////////
// Methods
//////////////////

FtpConfig.prototype.getConnectionInformations = function () {
  var informations = {
    type: self.getType(),
    host: self.getHost(),
    username: self.getUsername(),
    password: self.getPassword(),
    port: self.getPort(),
    destinationFolder: self.getDestinationFolder()
  };
  return informations;
};

module.exports = FtpConfig;
