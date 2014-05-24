var Config = require('./Config');
var util = require('util');

function SftpConfig() {
  Config.apply(this, Array.prototype.slice.call(arguments));
  this.type = "sftp";
}

util.inherits(SftpConfig,Config);

SftpConfig.prototype.getConnectionInformations = function () {
};

module.exports = SftpConfig;
