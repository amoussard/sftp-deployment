//////////////////
// Requires
//////////////////

var Config = require('./Config');
var util = require('util');
var fs = require('fs');

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
  this.sshKeyFile = "";

  /**
   * @type {String}
   */
  this.sshKeyPassphrase = "";

  self = this;
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
  self.sshKeyFile = _key;
};

/**
 * Ssh key file getter
 */
SftpConfig.prototype.getSshKeyFile = function () {
  return self.sshKeyFile;
};

/**
 * Ssh key passphrase setter
 * @param {String} _key
 */
SftpConfig.prototype.setSshKeyPassphrase = function (_passphrase) {
  self.sshKeyPassphrase = _passphrase;
};

/**
 * Ssh key passphrase getter
 */
SftpConfig.prototype.getSshKeyPassphrase = function () {
  return self.sshKeyPassphrase;
};

SftpConfig.prototype.getConnectionInformations = function () {
  var informations = {
    host: self.getHost(),
    username: self.getUsername(),
    port: self.getPort()
  };
  if (self.getSshKeyFile()) {
    informations.privateKey = fs.readFileSync(self.getSshKeyFile());
    if (self.getSshKeyPassphrase()) {
      informations.passphrase = self.getSshKeyPassphrase();
    }
  } else {
    informations.password = self.getPassword();
  }
  return informations;
};

SftpConfig.prototype.getDefaultFileContent = function () {
  return '{\n' +
  '  "type": "sftp",\n' +
  '  "host": "example.com",\n' +
  '  "user": "username",\n' +
  '  "password": "password",\n' +
  '  "port": "22",\n' +
  '  "remote_path": "/example/path",\n' +
  '  "ssh_key_file": "~/.ssh/id_rsa"\n' +
  '  "ssh_key_passphrase": "passphrase"\n' +
  '}';
};

module.exports = SftpConfig;
