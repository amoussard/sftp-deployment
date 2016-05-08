'use strict';
'use babel';

const path = require('path');

const ConfigFactory = require('./Config/ConfigFactory');
const ConnectionFactory = require('./Connections/ConnectionFactory');
const oFileManager = require('./FileSystem/FileManager');

const Exception = require('./Exceptions/Exception');
const NoConfigurationFileFoundException = require('./Exceptions/NoConfigurationFileFoundException');
const ConfigurationFileNotReadableException = require('./Exceptions/ConfigurationFileNotReadableException');
const ConfigurationFileSyntaxErrorException = require('./Exceptions/ConfigurationFileSyntaxErrorException');
const ConnectionErrorException = require('./Exceptions/ConnectionErrorException');
const UploadErrorException = require('./Exceptions/UploadErrorException');
const DownloadErrorException = require('./Exceptions/DownloadErrorException');
const RemoteDirectoryCreationErrorException = require('./Exceptions/RemoteDirectoryCreationErrorException');
const RemoteSystemErrorException = require('./Exceptions/RemoteSystemErrorException');
const DirectoryCreationErrorException = require('./Exceptions/DirectoryCreationErrorException');
const TransfertErrorException = require('./Exceptions/TransfertErrorException');
const RemoteDirectoryNotReadableException = require('./Exceptions/RemoteDirectoryNotReadableException');

const DEFAULT_CONFIGURATION_FILE = 'deployment-config.json';

class DeploymentManager
{
    constructor() {
        this.observers = [];
        this.configurationFileName = DEFAULT_CONFIGURATION_FILE;
    }

    registerObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers(value, data) {
        this.observers.forEach(observer => {
            observer.notify(value, data);
        });
    }

    _upload(files) {
        const configFactory = new ConfigFactory();
        const connectionFactory = new ConnectionFactory();
        const configPath = path.join(
            atom.project.rootDirectories[0].path,
            this.configurationFileName
        );

        return configFactory.loadConfig(configPath)
            .then(config => {
                if (!config.uploadConfigFile) {
                    files = files.filter(el => {
                        return el.relativePath !== this.configurationFileName;
                    });
                }

                return connectionFactory.openConnection(config);
            })
            .then(connection => {
                return connection.upload(files);
            })
            .then(connection => {
                return connection.close();
            })
            .then(success => {
                if (success) {
                    this.notifyObservers('upload_file_success');

                    return;
                }
                this.notifyObservers('upload_file_error');
            })
            .catch(ConfigurationFileSyntaxErrorException, e => {
                this.notifyObservers('configuration_file_syntax_error', e);
            })
            .catch(ConnectionErrorException, e => {
                this.notifyObservers('connection_error', e);
            })
            .catch(UploadErrorException, e => {
                this.notifyObservers('upload_file_error', e);
            })
            .catch(RemoteDirectoryCreationErrorException, e => {
                this.notifyObservers('remote_directory_creation_error', e);
            })
            .catch(RemoteSystemErrorException, e => {
                this.notifyObservers('remote_system_error', e);
            })
            .catch(TransfertErrorException, e => {
                this.notifyObservers('transfert_file_error', e);
            })
            .catch(Exception, e => {
                this.notifyObservers(e.getCode(), e);
            })
            .catch(e => {
                console.error(e);
            });
    }

    _download(nodes) {
        const configFactory = new ConfigFactory();
        const connectionFactory = new ConnectionFactory();
        const configPath = path.join(
            atom.project.rootDirectories[0].path,
            this.configurationFileName
        );
        let conn = null;

        return configFactory.loadConfig(configPath)
            .then(config => {
                return connectionFactory.openConnection(config);
            })
            .then(connection => {
                conn = connection;

                return connection.getTargetFiles(nodes);
            })
            .then(files => {
                return conn.download(files);
            })
            .then(connection => {
                return connection.close();
            })
            .then(success => {
                if (success) {
                    this.notifyObservers('download_file_success');

                    return;
                }
                this.notifyObservers('download_file_error');
            })
            .catch(NoConfigurationFileFoundException, () => {
                this.notifyObservers('no_configuration_file_found');
            })
            .catch(ConfigurationFileNotReadableException, () => {
                this.notifyObservers('configuration_file_not_readable');
            })
            .catch(ConfigurationFileSyntaxErrorException, e => {
                this.notifyObservers('configuration_file_syntax_error', e);
            })
            .catch(ConnectionErrorException, e => {
                this.notifyObservers('connection_error', e);
            })
            .catch(DownloadErrorException, e => {
                this.notifyObservers('download_file_error', e);
            })
            .catch(DirectoryCreationErrorException, e => {
                this.notifyObservers('directory_creation_error', e);
            })
            .catch(TransfertErrorException, e => {
                this.notifyObservers('transfert_file_error', e);
            })
            .catch(RemoteDirectoryNotReadableException, e => {
                this.notifyObservers('remote_directory_not_readable', e);
            })
            .catch(e => {
                console.error(e);
            });
    }

    generateConfigFile() {
        if (atom.project.rootDirectories
            && atom.project.rootDirectories.length === 0) {
            this.notifyObservers('project_not_found');

            return;
        }

        const configPath = path.join(
            atom.project.rootDirectories[0].path,
            this.configurationFileName
        );

        atom.confirm({
            message: 'Which type of configuration you want to generate ?',
            detailedMessage: 'Be careful, this will overwrite the existent configuration file !',
            buttons: {
                SFTP: () => {
                    ConfigFactory
                        .createSftpConfig()
                        .save(configPath)
                        .then(() => {
                            this.notifyObservers('configuration_file_creation_success');
                        })
                        .catch(e => {
                            this.notifyObservers('configuration_file_creation_error', e);
                        });
                },
                FTP: () => {
                    ConfigFactory
                        .createFtpConfig()
                        .save(configPath)
                        .then(() => {
                            this.notifyObservers('configuration_file_creation_success');
                        })
                        .catch(e => {
                            this.notifyObservers('configuration_file_creation_error', e);
                        });
                },
                Cancel: null
            }
        });
    }

    uploadCurrentFile() {
        const configFactory = new ConfigFactory();
        const configPath = path.join(
            atom.project.rootDirectories[0].path,
            this.configurationFileName
        );

        configFactory.loadConfig(configPath)
            .then(config => {
                oFileManager.getCurrentFile()
                    .then(file => {
                        if (config.uploadConfigFile
                            || !config.uploadConfigFile && file.relativePath !== this.configurationFileName) {
                            this.notifyObservers('begin_transfert');
                            this.upload([ file ]);
                        }
                    });
            });
    }

    uploadOnSave() {
        const configFactory = new ConfigFactory();
        const configPath = path.join(
            atom.project.rootDirectories[0].path,
            this.configurationFileName
        );

        configFactory.loadConfig(configPath)
            .then(config => {
                if (config.getUploadOnSave()) {
                    return this.uploadCurrentFile();
                }
            });
    }

    downloadCurrentFile() {
        atom.confirm({
            message: 'You will download the current file, be careful, it will be overwritten.',
            buttons: {
                Overwrite: () => {
                    this.notifyObservers('begin_transfert');

                    oFileManager.getCurrentFile()
                        .then(file => {
                            this._download([ file ]);
                        });
                },
                Cancel: null
            }
        });
    }

    uploadOpenFiles() {
        const configFactory = new ConfigFactory();
        const configPath = path.join(
            atom.project.rootDirectories[0].path,
            this.configurationFileName
        );

        configFactory.loadConfig(configPath)
            .then(config => {
                oFileManager.getOpenFiles()
                    .then(files => {
                        if (!config.uploadConfigFile) {
                            files = files.filter(file => {
                                return file.relativePath !== this.configurationFileName;
                            });

                            if (files.length === 0) {
                                return;
                            }
                        }

                        this.notifyObservers('begin_transfert');
                        this._upload(files);
                    });
            });
    }

    uploadSelection() {
        const configFactory = new ConfigFactory();
        const configPath = path.join(
            atom.project.rootDirectories[0].path,
            this.configurationFileName
        );

        configFactory.loadConfig(configPath)
            .then(config => {
                oFileManager.getSelection()
                    .then(files => {
                        if (!config.uploadConfigFile) {
                            files = files.filter(file => {
                                return file.relativePath !== this.configurationFileName;
                            });

                            if (files.length === 0) {
                                return;
                            }
                        }

                        this.notifyObservers('begin_transfert');
                        this._upload(files);
                    });
            });
    }

    downloadSelection() {
        atom.confirm({
            message: 'You will download all your selection, be careful, it will be overwritted.',
            buttons: {
                Overwrite: () => {
                    this.notifyObservers('begin_transfert');

                    oFileManager.getSelection()
                        .then(nodes => {
                            this._download(nodes);
                        });
                },
                Cancel: null
            }
        });
    }
}

module.exports = DeploymentManager;
