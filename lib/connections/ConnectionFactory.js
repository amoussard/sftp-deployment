'use strict';
'use babel';

const Promise = require('bluebird');

const SftpConnection = require('./SftpConnection');
const FtpConnection = require('./FtpConnection');

class ConnectionFactory
{
    createConnection(config) {
        const deferred = Promise.pending();

        try {
            let type = config.type;

            type = type.charAt(0).toUpperCase() + type.substring(1);

            const getter = `_create${type}Connection`;
            const connection = this[getter](config);

            deferred.resolve(connection);
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    openConnection(config) {
        return this.createConnection(config)
            .then(connection => {
                return connection.connect();
            });
    }

    static _createSftpConnection(config) {
        return new SftpConnection(config);
    }

    static _createFtpConnection(config) {
        return new FtpConnection(config);
    }
}

module.exports = ConnectionFactory;
