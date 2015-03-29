//////////////////
// Requires
//////////////////

var fs = require('fs');
var path = require('path');
var util = require('util');

var ConfigFactory = require('./configs/ConfigFactory');
var ConnectionFactory = require('./connections/ConnectionFactory');
var Connection = require('./connections/Connection');
var oFileManager = require('./filesystem/FileManager');

var OperationalError = require('bluebird').Promise.OperationalError;

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
    this.observers.push(observer);
};

DeploymentManager.prototype.notifyObservers = function(value, data) {
    this.observers.forEach(function (observer) {
        observer.notify(value, data);
    });
};

/**
 * Generate a default configuration file
 * Ask which protocol the user want to use
 */
DeploymentManager.prototype.generateConfigFile = function() {
    var configFactory = new ConfigFactory();

    if (atom.project.rootDirectories.length < 1) {
        self.notifyObservers("project_not_found");
        return;
    }

    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );

    atom.confirm({
        message: "Which type of configuration you want to generate ?",
        detailedMessage: "Be careful, this will overwrite the existent configuration file !",
        buttons: {
            "SFTP": function () {
                configFactory
                    .createSftpConfig()
                    .save(configPath)
                    .then(function() {
                        self.notifyObservers("configuration_file_creation_success");
                    })
                    .catch(function(e) {
                        self.notifyObservers("configuration_file_creation_error", e);
                    });
            },
            "FTP": function () {
                  configFactory
                      .createFtpConfig()
                      .save(configPath)
                      .then(function() {
                          self.notifyObservers("configuration_file_creation_success");
                      })
                      .catch(function(e) {
                          self.notifyObservers("configuration_file_creation_error", e);
                      });
            },
            "Cancel": null
        }
    });
};

/**
 * Upload the open tab file
 */
DeploymentManager.prototype.uploadCurrentFile = function(args) {
    var configFactory = new ConfigFactory();
    var connectionFactory = new ConnectionFactory();
    var files = [];
    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );

    oFileManager.getCurrentFile()
        .then(function(file) {
            files.push(file);
            return configFactory.loadConfig(configPath);
        })
        .then(function(config) {
            return connectionFactory.openConnection(config);
        })
        .then(function(connection) {
            return connection.upload(files);
        })
        .then(function(connection) {
            return connection.close();
        })
        .then(function(success) {
            if (success) {
                self.notifyObservers('upload_file_success');
                return;
            }
            self.notifyObservers('upload_file_error');
        })
        .catch(OperationalError, function(e) {
            console.error(e);
        })
        .catch(function(e) {
            console.error(e);
        });
};

/**
 * Download the open tab file
 */
DeploymentManager.prototype.downloadCurrentFile = function() {
    atom.confirm({
        message: "You will download the current file, be careful, it will be overwritted.",
        buttons: {
            "Overwrite": function () {
                var configFactory = new ConfigFactory();
                var connectionFactory = new ConnectionFactory();
                var files = [];
                var configPath = path.join(
                    atom.project.rootDirectories[0].path,
                    self.configurationFileName
                );

                oFileManager.getCurrentFile()
                    .then(function(file) {
                        files.push(file);
                        return configFactory.loadConfig(configPath);
                    })
                    .then(function(config) {
                        return connectionFactory.openConnection(config);
                    })
                    .then(function(connection) {
                        return connection.download(files);
                    })
                    .then(function(connection) {
                        return connection.close();
                    })
                    .then(function(success) {
                        if (success) {
                            self.notifyObservers('download_file_success');
                            return;
                        }
                        self.notifyObservers('download_file_error');
                    })
                    .catch(OperationalError, function(e) {
                        console.error(e);
                    })
                    .catch(function(e) {
                        console.error(e);
                    });
            },
            "Cancel": null
        }
    });
};

/**
 * Upload open tab files
 */
DeploymentManager.prototype.uploadOpenFiles = function() {
    var configFactory = new ConfigFactory();
    var connectionFactory = new ConnectionFactory();
    var files = null;
    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );

    oFileManager.getOpenFiles()
        .then(function(_files) {
            files = _files;
            return configFactory.loadConfig(configPath);
        })
        .then(function(config) {
            return connectionFactory.openConnection(config);
        })
        .then(function(connection) {
            return connection.upload(files);
        })
        .then(function(connection) {
            return connection.close();
        })
        .then(function(success) {
            if (success) {
                self.notifyObservers('upload_file_success');
                return;
            }
            self.notifyObservers('upload_file_error');
        })
        .catch(OperationalError, function(e) {
            console.error(e);
        })
        .catch(function(e) {
            console.error(e);
        });
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

module.exports = DeploymentManager;
