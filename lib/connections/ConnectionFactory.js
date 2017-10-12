"use babel";

import Promise from "bluebird";
import SftpConnection from "./SftpConnection";
import FtpConnection from "./FtpConnection";

export default class ConnectionFactory {
  createConnection(config) {
    const deferred = Promise.pending();

    try {
      const {port} = config;
      let connection;

      if (port === 22) {
        connection = this.createSftpConnection(config);
      } else {
        connection = this.createFtpConnection(config);
      }

      deferred.resolve(connection);
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  openConnection(config) {
    return this.createConnection(config).
      then((connection) => connection.connect());
  }

  createSftpConnection(config) {
    return new SftpConnection(config);
  }

  createFtpConnection(config) {
    return new FtpConnection(config);
  }
}

