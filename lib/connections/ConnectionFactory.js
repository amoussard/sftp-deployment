//////////////////
// Requires
//////////////////

var SftpConnection = require("./SftpConnection");
var FtpConnection = require("./FtpConnection");

var self;

//////////////////
// Ctor
//////////////////

function ConnectionFactory() {
  self = this;
}

//////////////////
// Methods
//////////////////

/**
 * @return {SftpConnection}
 */
ConnectionFactory.prototype.createConnection = function (config) {
  var connection = null;
  switch (config.getType()) {
    case 'sftp':
      connection = self.getSftpConnection();
      break;
    case 'ftp':
      connection = self.getFtpConnection();
      break;
    default:
      break;
  }
  return connection;
};

/**
 * @return {SftpConnection}
 */
ConnectionFactory.prototype.getSftpConnection = function () {
  return new SftpConnection();
};

/**
 * @return {FtpConnection}
 */
ConnectionFactory.prototype.getFtpConnection = function () {
  return new FtpConnection();
};

module.exports = ConnectionFactory;
