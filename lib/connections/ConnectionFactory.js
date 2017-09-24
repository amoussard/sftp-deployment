"use babel";

import Promise from "bluebird";
import SftpConnection from "./SftpConnection";
import FtpConnection from "./FtpConnection";

export default class ConnectionFactory {
  createConnection(config) {
    const deferred = Promise.pending();

    try {
      let type = config.type;

      type = type.charAt(0).toUpperCase() + type.substring(1);
      const getter = "create" + type + "Connection";
      const connection = this[getter](config);

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

