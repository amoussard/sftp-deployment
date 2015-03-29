//////////////////
// Requires
//////////////////

var Config = require('./Config');
var util = require('util');

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
}

util.inherits(FtpConfig, Config);

module.exports = FtpConfig;
