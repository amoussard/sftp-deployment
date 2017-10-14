"use babel";

/* global atom */

import * as path from "path";
import ConfigFactory from "./configs/ConfigFactory";
import ConnectionFactory from "./connections/ConnectionFactory";
import FileManager from "./filesystem/FileManager";
import NoConfigurationFileFoundException from "./exceptions/NoConfigurationFileFoundException";
import ConfigurationFileNotReadableException from "./exceptions/ConfigurationFileNotReadableException";
import ConfigurationFileSyntaxErrorException from "./exceptions/ConfigurationFileSyntaxErrorException";
import ConnectionErrorException from "./exceptions/ConnectionErrorException";
import UploadErrorException from "./exceptions/UploadErrorException";
import DownloadErrorException from "./exceptions/DownloadErrorException";
import RemoteDirectoryCreationErrorException from "./exceptions/RemoteDirectoryCreationErrorException";
import RemoteSystemErrorException from "./exceptions/RemoteSystemErrorException";
import DirectoryCreationErrorException from "./exceptions/DirectoryCreationErrorException";
import TransfertErrorException from "./exceptions/TransfertErrorException";
import RemoteDirectoryNotReadableException from "./exceptions/RemoteDirectoryNotReadableException";

export default class DeploymentManager {
  constructor() {
    this.observers = [];
    this.configurationFileName = "atom-sftp-sync.json";
  }

  registerObserver(observer) {
    this.observers.push(observer);
  }

  notifyObservers(value, data) {
    this.observers.forEach((observer) => {
      observer.notify(value, data);
    });
  }

  upload(files) {
    const configFactory = new ConfigFactory();
    const connectionFactory = new ConnectionFactory();
    const configPath = path.join(
      atom.project.rootDirectories[0].path,
      this.configurationFileName
    );

    return configFactory.loadConfig(configPath)
      .then((config) => {
        if (!config.uploadConfigFile) {
          files = files.filter((el) => el.relativePath !== this.configurationFileName);
        }

        return connectionFactory.openConnection(config);
      })
      .then((connection) => connection.upload(files))
      .then((connection) => connection.close())
      .then((success) => {
        if (success) {
          this.notifyObservers("upload_file_success");

          return;
        }
        this.notifyObservers("upload_file_error");
      })
      .catch(NoConfigurationFileFoundException, () => {
        this.notifyObservers("no_configuration_file_found");
      })
      .catch(ConfigurationFileNotReadableException, () => {
        this.notifyObservers("configuration_file_not_readable");
      })
      .catch(ConfigurationFileSyntaxErrorException, (e) => {
        this.notifyObservers("configuration_file_syntax_error", e);
      })
      .catch(ConnectionErrorException, (e) => {
        this.notifyObservers("connection_error", e);
      })
      .catch(UploadErrorException, (e) => {
        this.notifyObservers("upload_file_error", e);
      })
      .catch(RemoteDirectoryCreationErrorException, (e) => {
        this.notifyObservers("remote_directory_creation_error", e);
      })
      .catch(RemoteSystemErrorException, (e) => {
        this.notifyObservers("remote_system_error", e);
      })
      .catch(TransfertErrorException, (e) => {
        this.notifyObservers("transfert_file_error", e);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  download(nodes) {
    const configFactory = new ConfigFactory();
    const connectionFactory = new ConnectionFactory();
    const configPath = path.join(
      atom.project.rootDirectories[0].path,
      this.configurationFileName
    );
    let conn = null;

    return configFactory.loadConfig(configPath)
      .then((config) => connectionFactory.openConnection(config))
      .then((connection) => {
        conn = connection;

        return connection.getTargetFiles(nodes);
      })
      .then((files) => conn.download(files))
      .then((connection) => connection.close())
      .then((success) => {
        if (success) {
          this.notifyObservers("download_file_success");

          return;
        }
        this.notifyObservers("download_file_error");
      })
      .catch(NoConfigurationFileFoundException, () => {
        this.notifyObservers("no_configuration_file_found");
      })
      .catch(ConfigurationFileNotReadableException, () => {
        this.notifyObservers("configuration_file_not_readable");
      })
      .catch(ConfigurationFileSyntaxErrorException, (e) => {
        this.notifyObservers("configuration_file_syntax_error", e);
      })
      .catch(ConnectionErrorException, (e) => {
        this.notifyObservers("connection_error", e);
      })
      .catch(DownloadErrorException, (e) => {
        this.notifyObservers("download_file_error", e);
      })
      .catch(DirectoryCreationErrorException, (e) => {
        this.notifyObservers("directory_creation_error", e);
      })
      .catch(TransfertErrorException, (e) => {
        this.notifyObservers("transfert_file_error", e);
      })
      .catch(RemoteDirectoryNotReadableException, (e) => {
        this.notifyObservers("remote_directory_not_readable", e);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  generateConfigFile() {
    const configFactory = new ConfigFactory();

    if (atom.project.rootDirectories &&
      atom.project.rootDirectories.length < 1) {
      this.notifyObservers("project_not_found");

      return;
    }

    const configPath = path.join(
      atom.project.rootDirectories[0].path,
      this.configurationFileName
    );

    atom.confirm({
      message: "Which type of configuration you want to generate ?",
      detailedMessage: "Be careful, this will overwrite the existent configuration file !",
      buttons: {
        "SFTP": () => {
          configFactory
            .createSftpConfig()
            .save(configPath)
            .then(() => {
              this.notifyObservers("configuration_file_creation_success");
            })
            .catch((e) => {
              this.notifyObservers("configuration_file_creation_error", e);
            });
        },
        "FTP": () => {
          configFactory
            .createFtpConfig()
            .save(configPath)
            .then(() => {
              this.notifyObservers("configuration_file_creation_success");
            })
            .catch((e) => {
              this.notifyObservers("configuration_file_creation_error", e);
            });
        },
        "Cancel": null
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
      .then((config) => {
        FileManager.getCurrentFile()
          .then((file) => {
            if (!config.uploadConfigFile && file.relativePath === this.configurationFileName) {

            } else {
              this.notifyObservers("begin_transfert");
              this.upload([file]);
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
      .then((config) => {
        if (config.uploadOnSave) {
          return this.uploadCurrentFile();
        }
      });
  }

  downloadCurrentFile() {
    atom.confirm({
      message: "You will download the current file, be careful, it will be overwritten.",
      buttons: {
        "Overwrite": () => {
          this.notifyObservers("begin_transfert");
          FileManager.getCurrentFile()
            .then((file) => {
              this.download([file]);
            });
        },
        "Cancel": null
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
      .then((config) => {
        FileManager.getOpenFiles()
          .then((files) => {
            if (!config.uploadConfigFile) {
              files = files.filter((file) => file.relativePath !== this.configurationFileName);
              if (files.length === 0) {
                return;
              }
            }
            this.notifyObservers("begin_transfert");
            this.upload(files);
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
      .then((config) => {
        FileManager.getSelection()
          .then((files) => {
            if (!config.uploadConfigFile) {
              files = files.filter((file) => file.relativePath !== this.configurationFileName);
              if (files.length === 0) {
                return;
              }
            }
            this.notifyObservers("begin_transfert");
            this.upload(files);
          });
      });
  }

  downloadSelection() {
    atom.confirm({
      message: "You will download all your selection, be careful, it will be overwritted.",
      buttons: {
        "Overwrite": () => {
          this.notifyObservers("begin_transfert");
          FileManager.getSelection()
            .then((nodes) => {
              this.download(nodes);
            });
        },
        "Cancel": null
      }
    });
  }
}

