//////////////////
// Requires
//////////////////

var fs = require('fs');
var path = require('path');

var ConfigFactory = require('./configs/ConfigFactory');
var ConnectionFactory = require('./connections/ConnectionFactory');
var Connection = require('./connections/Connection');
var File = require('./filesystem/File');

var self;

//////////////////
// Ctor
//////////////////

function DeploymentManager() {
  this.observers = [];
  this.configurationFileName = "deployment-config.json";

  self = this;
}

//////////////////
// Methods
//////////////////

DeploymentManager.prototype.registerObserver = function(observer) {
  self.observers.push(observer);
};

var notifyObservers = function(value, data) {
  self.observers.forEach(function (item) {
    item.notify(value, data);
  });
};

/**
 * Create configuration file with the content of the config object
 *
 * @param {Config} config Config object that you want to write
 */
var writeConfig = function(config) {
  fs.writeFile(path.join(atom.project.path, self.configurationFileName), JSON.stringify(config.getConnectionInformations(), undefined, 2));
};

/**
 * Test if the configuration file exist
 * @param {Function} callback [description]
 */
var configurationFileExist = function(callback) {
  fs.exists(path.join(atom.project.path, self.configurationFileName), function(exists) {
    if (exists) {
      notifyObservers("configuration_file_exists", {
        filename: self.configurationFileName
      });
      callback();
    } else {
      notifyObservers("configuration_file_doesnt_exist", {
        filename: self.configurationFileName
      });
    }
  });
};

/**
 * Get the file of current open tab
 * @return {File}
 */
var getCurrentFilePath = function() {
  var srcFile = path.relative(atom.project.path, atom.workspace.activePaneItem.buffer.file.path);
  var file = new File(srcFile);
  return file;
};

/**
 * Generate a default configuration file
 * Ask which protocol the user want to use
 */
DeploymentManager.prototype.generateConfigFile = function() {
  var configFactory = new ConfigFactory();

  atom.confirm({
    message: "Which type of configuration you want to generate ?",
    detailedMessage: "Be careful, this will overwrite the existent configuration file !",
    buttons: {
      "SFTP": function () {
        writeConfig(configFactory.getSftpConfig());
      },
      "FTP": function () {
        writeConfig(configFactory.getFtpConfig());
      },
      "Cancel": null
    }
  });
};

/**
 * Upload the open tab file
 */
DeploymentManager.prototype.uploadCurrentFile = function() {
  configurationFileExist(function () {
    var configFactory = new ConfigFactory();
    var connectionFactory = new ConnectionFactory();

    configFactory.on("configuration_ready", function(config) {
      notifyObservers("configuration_ready", config);

      var connection = connectionFactory.createConnection(config);

      connection.on('connection_error', function (err) {
        notifyObservers("connection_error", err);
      });

      connection.on('connection_sftp_end', function () {
        notifyObservers("connection_sftp_end");
      });

      connection.on('sftp_mkdir', function (directory) {
        notifyObservers("sftp_mkdir", directory);
      });

      connection.on('sftp_mkdir_upload_file_error', function (directory) {
        notifyObservers("sftp_mkdir_upload_file_error", directory);
      });

      connection.on('sftp_upload_file', function (file) {
        notifyObservers("sftp_upload_file", file);
      });

      connection.on('sftp_upload_file_error', function (file) {
        notifyObservers("sftp_upload_file_error", file);
      });

      connection.on('sftp_upload_file_success', function (file) {
        notifyObservers("sftp_upload_file_success", file);
      });

      connection.on('connection_ready', function () {
        notifyObservers("connection_ready", connection);

        var file = getCurrentFilePath();
        connection.uploadFiles([file]);
      });

      connection.init(config);
    });

    configFactory.createConfig(self.configurationFileName);
  });
};

module.exports = DeploymentManager;
