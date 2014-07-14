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
    host: self.getHost(),
    user: self.getUsername(),
    password: self.getPassword(),
    port: self.getPort(),
  };
  return informations;
};

FtpConfig.prototype.getDefaultFileContent = function () {
  return '{\n' +
  '  "type": "ftp",\n' +
  '  "host": "example.com",\n' +
  '  "user": "username",\n' +
  '  "password": "password",\n' +
  '  "port": "21",\n' +
  '  "remote_path": "/example/path"\n' +
  '  "upload_on_save": "false",\n' +
  '}';
};

module.exports = FtpConfig;
