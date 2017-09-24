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
var NoConfigurationFileFoundException = require('./exceptions/NoConfigurationFileFoundException');
var ConfigurationFileNotReadableException = require('./exceptions/ConfigurationFileNotReadableException');
var ConfigurationFileSyntaxErrorException = require('./exceptions/ConfigurationFileSyntaxErrorException');
var ConnectionErrorException = require('./exceptions/ConnectionErrorException');
var UploadErrorException = require('./exceptions/UploadErrorException');
var DownloadErrorException = require('./exceptions/DownloadErrorException');
var RemoteDirectoryCreationErrorException = require('./exceptions/RemoteDirectoryCreationErrorException');
var RemoteSystemErrorException = require('./exceptions/RemoteSystemErrorException');
var DirectoryCreationErrorException = require('./exceptions/DirectoryCreationErrorException');
var TransfertErrorException = require('./exceptions/TransfertErrorException');
var RemoteDirectoryNotReadableException = require('./exceptions/RemoteDirectoryNotReadableException');

var self;

//////////////////
// Ctor
//////////////////

function DeploymentManager() {
    this.observers = [];
    this.configurationFileName = "atom-sftp-sync.json";

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
            if (!config.uploadConfigFile) {
              files = files.filter(function (el) {
                return el.relativePath !== self.configurationFileName;
              });
            }
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
        .catch(NoConfigurationFileFoundException, function(e) {
            self.notifyObservers('no_configuration_file_found');
        })
        .catch(ConfigurationFileNotReadableException, function(e) {
            self.notifyObservers('configuration_file_not_readable');
        })
        .catch(ConfigurationFileSyntaxErrorException, function(e) {
            self.notifyObservers('configuration_file_syntax_error', e);
        })
        .catch(ConnectionErrorException, function(e) {
            self.notifyObservers('connection_error', e);
        })
        .catch(UploadErrorException, function(e) {
            self.notifyObservers('upload_file_error', e);
        })
        .catch(RemoteDirectoryCreationErrorException, function(e) {
            self.notifyObservers('remote_directory_creation_error', e);
        })
        .catch(RemoteSystemErrorException, function(e) {
            self.notifyObservers('remote_system_error', e);
        })
        .catch(TransfertErrorException, function(e) {
            self.notifyObservers('transfert_file_error', e);
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
        .catch(NoConfigurationFileFoundException, function(e) {
            self.notifyObservers('no_configuration_file_found');
        })
        .catch(ConfigurationFileNotReadableException, function(e) {
            self.notifyObservers('configuration_file_not_readable');
        })
        .catch(ConfigurationFileSyntaxErrorException, function(e) {
            self.notifyObservers('configuration_file_syntax_error', e);
        })
        .catch(ConnectionErrorException, function(e) {
            self.notifyObservers('connection_error', e);
        })
        .catch(DownloadErrorException, function(e) {
            self.notifyObservers('download_file_error', e);
        })
        .catch(DirectoryCreationErrorException, function(e) {
            self.notifyObservers('directory_creation_error', e);
        })
        .catch(TransfertErrorException, function(e) {
            self.notifyObservers('transfert_file_error', e);
        })
        .catch(RemoteDirectoryNotReadableException, function(e) {
            self.notifyObservers('remote_directory_not_readable', e);
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

    if (atom.project.rootDirectories
        && atom.project.rootDirectories.length < 1) {
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
    var configFactory = new ConfigFactory();
    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );

    configFactory.loadConfig(configPath)
        .then(function(config) {
            oFileManager.getCurrentFile()
                .then(function(file) {
                    if (!config.uploadConfigFile && file.relativePath == self.configurationFileName) {
                        return;
                    }else {
                        self.notifyObservers('begin_transfert');
                        self.upload([file]);
                    }
                });
        });
};

/**
 * Upload on save
 */
DeploymentManager.prototype.uploadOnSave = function() {
    var configFactory = new ConfigFactory();
    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );

    configFactory.loadConfig(configPath)
        .then(function(config) {
            if (config.uploadOnSave) {
                return self.uploadCurrentFile();
            }
        });
};

/**
 * Download the open tab file
 */
DeploymentManager.prototype.downloadCurrentFile = function() {
    atom.confirm({
        message: "You will download the current file, be careful, it will be overwritten.",
        buttons: {
            "Overwrite": function () {
                self.notifyObservers('begin_transfert');
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
    var configFactory = new ConfigFactory();
    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );

    configFactory.loadConfig(configPath)
        .then(function(config) {
            oFileManager.getOpenFiles()
                .then(function(files) {
                    if (!config.uploadConfigFile) {
                        files = files.filter(function (file) {
                            return file.relativePath != self.configurationFileName;
                        });
                        if (files.length == 0) {
                            return;
                        }
                    }
                    self.notifyObservers('begin_transfert');
                    self.upload(files);
                });
        });
};

/**
 * Upload a tree-view selection
 */
DeploymentManager.prototype.uploadSelection = function() {
    var configFactory = new ConfigFactory();
    var configPath = path.join(
        atom.project.rootDirectories[0].path,
        self.configurationFileName
    );

    configFactory.loadConfig(configPath)
        .then(function(config) {
            oFileManager.getSelection()
                .then(function(files) {
                    if (!config.uploadConfigFile) {
                        files = files.filter(function (file) {
                            return file.relativePath != self.configurationFileName;
                        });
                        if (files.length == 0) {
                            return;
                        }
                    }
                    self.notifyObservers('begin_transfert');
                    self.upload(files);
                });
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
                self.notifyObservers('begin_transfert');
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
