//////////////////
// Requires
//////////////////

var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ConfigFactory = require('./configs/ConfigFactory');
var ConnectionFactory = require('./connections/ConnectionFactory');
var Connection = require('./connections/Connection');
var oFileManager = require('./filesystem/FileManager');

var self;

//////////////////
// Ctor
//////////////////

function DeploymentManager() {
  this.observers = [];
  this.configurationFileName = "deployment-config.json";

  self = this;
}

util.inherits(DeploymentManager, EventEmitter);

//////////////////
// Methods
//////////////////

DeploymentManager.prototype.registerObserver = function(observer) {
  self.observers.push(observer);
};

var notifyObservers = function(value, data) {
  self.observers.forEach(function (observer) {
    observer.notify(value, data);
  });
};

/**
 * Create configuration file with the content of the config object
 *
 * @param {Config} config Config object that you want to write
 */
var writeConfig = function(config) {
  fs.writeFile(
    path.join(atom.project.path, self.configurationFileName),
    config.getDefaultFileContent()
  );
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
 * Generate a default configuration file
 * Ask which protocol the user want to use
 */
DeploymentManager.prototype.generateConfigFile = function() {
  var configFactory = new ConfigFactory();

  if (atom.project.path === undefined) {
    notifyObservers("project_not_found");
    return;
  }

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

var bindEvents = function (connection) {
  connection.on('connection_error', function (err) {
    notifyObservers("connection_error", err);
  });

  connection.on('connection_sftp_end', function () {
    notifyObservers("connection_sftp_end");
  });
  connection.on('connection_ftp_end', function () {
    notifyObservers("connection_ftp_end");
  });

  connection.on('sftp_mkdir', function (directory) {
    notifyObservers("sftp_mkdir", directory);
  });
  connection.on('ftp_mkdir', function (directory) {
    notifyObservers("ftp_mkdir", directory);
  });

  connection.on('sftp_mkdir_upload_file_error', function (directory) {
    notifyObservers("sftp_mkdir_upload_file_error", directory);
  });
  connection.on('ftp_mkdir_upload_file_error', function (directory) {
    notifyObservers("ftp_mkdir_upload_file_error", directory);
  });

  connection.on('sftp_upload_file', function (file) {
    notifyObservers("sftp_upload_file", file);
  });
  connection.on('ftp_upload_file', function (file) {
    notifyObservers("ftp_upload_file", file);
  });

  connection.on('sftp_upload_file_error', function (file) {
    notifyObservers("sftp_upload_file_error", file);
  });
  connection.on('ftp_upload_file_error', function (file) {
    notifyObservers("ftp_upload_file_error", file);
  });

  connection.on('sftp_upload_file_success', function (file) {
    notifyObservers("sftp_upload_file_success", file);
  });
  connection.on('ftp_upload_file_success', function (file) {
    notifyObservers("ftp_upload_file_success", file);
  });

  connection.on('sftp_download_file', function (file) {
    notifyObservers("sftp_download_file", file);
  });
  connection.on('ftp_download_file', function (file) {
    notifyObservers("ftp_download_file", file);
  });

  connection.on('sftp_download_file_error', function (file) {
    notifyObservers("sftp_download_file_error", file);
  });
  connection.on('ftp_download_file_error', function (file) {
    notifyObservers("ftp_download_file_error", file);
  });

  connection.on('sftp_download_file_success', function (file) {
    notifyObservers("sftp_download_file_success", file);
  });
  connection.on('ftp_download_file_success', function (file) {
    notifyObservers("ftp_download_file_success", file);
  });
};

/**
 * Initialize and open connection
 * Send a connection_ready event
 */
DeploymentManager.prototype.initConnection = function () {
  var self = this;

  configurationFileExist(function () {
    var configFactory = new ConfigFactory();
    var connectionFactory = new ConnectionFactory();

    configFactory.on("configuration_ready", function(config) {
      self.emit("configuration_ready", config);

      var connection = connectionFactory.createConnection(config);

      bindEvents(connection);

      connection.on('connection_ready', function () {
        self.emit('connection_ready', connection);
      });

      connection.init(config);
    });

    configFactory.createConfig(self.configurationFileName);
  });
};

/**
 * Upload the open tab file
 */
DeploymentManager.prototype.uploadCurrentFile = function() {
  var connectionReady = function (connection) {
    self.removeListener('connection_ready', connectionReady);

    var filesReady = function(aFiles) {
      oFileManager.removeListener("files_ready", filesReady);

      connection.uploadFiles(aFiles);
    };
    oFileManager.on("files_ready", filesReady);

    oFileManager.getCurrentFile();
  };

  self.on('connection_ready', connectionReady);

  self.initConnection();
};

/**
 * Download current file
 */
DeploymentManager.prototype.downloadCurrentFile = function() {
  atom.confirm({
    message: "You will download the current file, be careful, it will be overwritted.",
    buttons: {
      "Overwrite": function () {
        var connectionReady = function (connection) {
          self.removeListener('connection_ready', connectionReady);

          var filesReady = function(aFiles) {
            oFileManager.removeListener("files_ready", filesReady);

            connection.downloadFiles(aFiles);
          };
          oFileManager.on("files_ready", filesReady);

          oFileManager.getCurrentFile();
        };

        self.on('connection_ready', connectionReady);

        self.initConnection();
      },
      "Cancel": null
    }
  });
};

/**
 * Upload open tab files
 */
DeploymentManager.prototype.uploadOpenFiles = function() {
  var connectionReady = function (connection) {
    self.removeListener('connection_ready', connectionReady);

    var filesReady = function(aFiles) {
      oFileManager.removeListener("files_ready", filesReady);

      connection.uploadFiles(aFiles);
    };
    oFileManager.on("files_ready", filesReady);

    oFileManager.getOpenFiles();
  };

  self.on('connection_ready', connectionReady);

  self.initConnection();
};

/**
 * Upload a tree-view selection
 */
DeploymentManager.prototype.uploadSelection = function() {
  var connectionReady = function (connection) {
    self.removeListener('connection_ready', connectionReady);

    var filesReady = function(aFiles) {
      oFileManager.removeListener("files_ready", filesReady);

      connection.uploadFiles(aFiles);
    };
    oFileManager.on("files_ready", filesReady);

    oFileManager.getSelection();
  };

  self.on('connection_ready', connectionReady);

  self.initConnection();
};

/**
 * Download a tree-view selection
 */
DeploymentManager.prototype.downloadSelection = function() {
  atom.confirm({
    message: "You will download all your selection, be careful, it will be overwritted.",
    buttons: {
      "Overwrite": function () {
        var connectionReady = function (connection) {
          self.removeListener('connection_ready', connectionReady);

          var filesReady = function(aFiles) {
            oFileManager.removeListener("files_ready", filesReady);

            connection.downloadFiles(aFiles);
          };
          oFileManager.on("files_ready", filesReady);

          oFileManager.getSelection();
        };

        self.on('connection_ready', connectionReady);

        self.initConnection();
      },
      "Cancel": null
    }
  });
};

//////////////////
// Events
//////////////////

DeploymentManager.prototype.on('connection_ready', function (connection) {
  notifyObservers("connection_ready", connection);
});

module.exports = DeploymentManager;
