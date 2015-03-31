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

DeploymentManager.prototype.upload = function(files) {
    var configFactory = new ConfigFactory();
    var connectionFactory = new ConnectionFactory();
    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );

    return configFactory.loadConfig(configPath)
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

DeploymentManager.prototype.download = function(nodes) {
    var configFactory = new ConfigFactory();
    var connectionFactory = new ConnectionFactory();
    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );
    var conn = null;

    return configFactory.loadConfig(configPath)
        .then(function(config) {
            return connectionFactory.openConnection(config);
        })
        .then(function(connection) {
            conn = connection;
            return connection.getTargetFiles(nodes);
        })
        .then(function(files) {
            return conn.download(files);
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
DeploymentManager.prototype.uploadCurrentFile = function() {
    oFileManager.getCurrentFile()
        .then(function(file) {
            self.upload([file]);
        });
};

/**
 * Upload on save
 */
DeploymentManager.prototype.uploadOnSave = function() {

    if(atom.config.get("sftp-deployment.uploadOnSave")) {
        return self.uploadCurrentFile();
    }
};

/**
 * Download the open tab file
 */
DeploymentManager.prototype.downloadCurrentFile = function() {
    atom.confirm({
        message: "You will download the current file, be careful, it will be overwritten.",
        buttons: {
            "Overwrite": function () {
                oFileManager.getCurrentFile()
                    .then(function(file) {
                        self.download([file]);
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
    oFileManager.getOpenFiles()
        .then(function(files) {
            self.upload(files);
        });
};

/**
 * Upload a tree-view selection
 */
DeploymentManager.prototype.uploadSelection = function() {
    oFileManager.getSelection(true)
        .then(function(files) {
            self.upload(files);
        });
};

/**
 * Download a tree-view selection
 */
DeploymentManager.prototype.downloadSelection = function() {
  atom.confirm({
    message: "You will download all your selection, be careful, it will be overwritted.",
    buttons: {
      "Overwrite": function () {
          oFileManager.getSelection()
              .then(function(nodes) {
                  self.download(nodes);
              });
      },
      "Cancel": null
    }
  });
};

module.exports = DeploymentManager;
