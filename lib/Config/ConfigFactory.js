'use strict';
'use babel';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const OperationalError = require('bluebird').Promise.OperationalError;

const SftpConfig = require('./SftpConfig');
const FtpConfig = require('./FtpConfig');
const NoConfigurationFileFoundException = require('././NoConfigurationFileFoundException');
const ConfigurationFileNotReadableException = require('././ConfigurationFileNotReadableException');
const ConfigurationFileSyntaxErrorException = require('././ConfigurationFileSyntaxErrorException');

class ConfigFactory
{
    createConfig(configData) {
        const deferred = Promise.pending();

        try {
            let type = configData.type;

            type = type.charAt(0).toUpperCase() + type.substring(1);

            const getter = `create${type}Config`;
            const config = ConfigFactory[getter]();

            for (const key in configData) {
                if (configData.hasOwnProperty(key) && config[key]) {
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
        return fs.readFileAsync(configPath, 'utf8')
            .then(content => {
                return ConfigFactory._parseConfigFile(content);
            })
            .then(configData => {
                return this.createConfig(configData);
            })
            .catch(OperationalError, e => {
                if (e.code === 'ENOENT') {
                    throw new NoConfigurationFileFoundException();
                } else if (e.code === 'EACCES') {
                    throw new ConfigurationFileNotReadableException();
                } else {
                    throw e;
                }
            });
    }

    static _parseConfigFile(content) {
        const deferred = Promise.pending();

        try {
            const configData = JSON.parse(content);

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

    static createSftpConfig() {
        return new SftpConfig();
    }

    static createFtpConfig() {
        return new FtpConfig();
    }
}

module.exports = ConfigFactory;
