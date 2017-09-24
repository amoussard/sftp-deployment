"use babel";

import Promise from "bluebird";
import * as fs from "fs";
import SftpConfig from "./SftpConfig";
import FtpConfig from "./FtpConfig";
import NoConfigurationFileFoundException from "./../exceptions/NoConfigurationFileFoundException";
import ConfigurationFileNotReadableException from "./../exceptions/ConfigurationFileNotReadableException";
import ConfigurationFileSyntaxErrorException from "./../exceptions/ConfigurationFileSyntaxErrorException";

const OperationalError = Promise.OperationalError;

export default class ConfigFactory {
  parseConfigFile(content) {
    var deferred = Promise.pending();

    try {
      var configData = JSON.parse(content);
      deferred.fulfill(configData);
    } catch(e) {
      if (e.name === 'SyntaxError') {
        deferred.reject(new ConfigurationFileSyntaxErrorException(e.message));
      } else {
        deferred.reject(e);
      }
    }

    return deferred.promise;
  }

  createConfig(configData) {
    var deferred = Promise.pending();

    try {
      var type = configData.type;
      type = type.charAt(0).toUpperCase() + type.substring(1);
      var getter = 'create' + type + 'Config';
      var config = this[getter]();

      for (var key in configData) {
        if (config[key] !== undefined) {
          config[key] = configData[key];
        }
      }
      deferred.resolve(config);
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  loadConfig(configPath) {
    const readFile = Promise.promisify(fs.readFile);

    return readFile(configPath, 'utf8')
      .then((content) => {
        return this.parseConfigFile(content);
      })
      .then((configData) => {
        return this.createConfig(configData);
      })
      .catch(OperationalError, (e) => {
        if (e.code === 'ENOENT') {
          throw new NoConfigurationFileFoundException();
        } else if (e.code === 'EACCES') {
          throw new ConfigurationFileNotReadableException();
        } else {
          throw e;
        }
      });
  }

  createSftpConfig() {
    return new SftpConfig();
  }

  createFtpConfig() {
    return new FtpConfig();
  }
}

