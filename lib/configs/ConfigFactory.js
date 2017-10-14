"use babel";

import Promise from "bluebird";
import * as fs from "fs";
import Config from "./Config";
import NoConfigurationFileFoundException from "./../exceptions/NoConfigurationFileFoundException";
import ConfigurationFileNotReadableException from "./../exceptions/ConfigurationFileNotReadableException";
import ConfigurationFileSyntaxErrorException from "./../exceptions/ConfigurationFileSyntaxErrorException";

const {OperationalError} = Promise;

export default class ConfigFactory {
  parseConfigFile(content) {
    const deferred = Promise.pending();

    try {
      const configData = JSON.parse(content);

      deferred.fulfill(configData);
    } catch (e) {
      if (e.name === "SyntaxError") {
        deferred.reject(new ConfigurationFileSyntaxErrorException(e.message));
      } else {
        deferred.reject(e);
      }
    }

    return deferred.promise;
  }

  createConfig(configData) {
    const deferred = Promise.pending();

    try {
      const config = new Config();

      for (const [key, value] of Object.entries(configData)) {
        if (value) {
          config[key] = value;
        }
      }

      deferred.resolve(config);
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  loadConfig(configPath) {
    const readFile = Promise.promisify(fs.readFile);

    return readFile(configPath, "utf8")
      .then((content) => this.parseConfigFile(content))
      .then((configData) => this.createConfig(configData))
      .catch(OperationalError, (e) => {
        if (e.code === "ENOENT") {
          throw new NoConfigurationFileFoundException();
        } else if (e.code === "EACCES") {
          throw new ConfigurationFileNotReadableException();
        } else {
          throw e;
        }
      });
  }

  createSftpConfig() {
    const config = new Config();

    config.port = 22;

    return config;
  }

  createFtpConfig() {
    const config = new Config();

    config.port = 21;

    return config;
  }
}

