//////////////////
// Requires
//////////////////

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var path = require('path');

var SftpConfig = require("./SftpConfig");
var FtpConfig = require("./FtpConfig");

var self;

//////////////////
// Ctor
//////////////////

function ConfigFactory() {
  self = this;
}

util.inherits(ConfigFactory, EventEmitter);

//////////////////
// Methods
//////////////////

/**
 * Create configuration from a file
 * @param {String}   file
 * @param {Function} callback
 */
ConfigFactory.prototype.createConfig = function (file, callback) {
  var config = null;

  fs.readFile(path.join(atom.project.path, file), 'utf8', function(err, data) {
    if (err) {
      throw "cant_read_configuration_file";
    }
    var configData = JSON.parse(data);
    switch (configData.type) {
      case "sftp":
        config = self.getSftpConfig();
        if (configData.ssh_key_file) {
          config.setSshKeyFile(configData.ssh_key_file);
        }
        break;
      case "ftp":
        config = self.getFtpConfig();
        break;
      default:
        break;
    }
    if (configData.host) {
      config.setHost(configData.host);
    }
    if (configData.user) {
      config.setUsername(configData.user);
    }
    if (configData.password) {
      config.setPassword(configData.password);
    }
    if (configData.port) {
      config.setPort(configData.port);
    }
    if (configData.remote_path) {
      config.setRemotePath(configData.remote_path);
    }
    self.emit('configuration_ready', config);
    if (callback) {
      callback(config);
    }
  });
};

/**
 * @return {SftpConfig}
 */
ConfigFactory.prototype.getSftpConfig = function () {
  return new SftpConfig();
};

/**
 * @return {FtpConfig}
 */
ConfigFactory.prototype.getFtpConfig = function () {
  return new FtpConfig();
};

module.exports = ConfigFactory;
