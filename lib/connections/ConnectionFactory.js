"use babel";

import Promise from "bluebird";
import SftpConnection from "./SftpConnection";
import FtpConnection from "./FtpConnection";

export default class ConnectionFactory {
  createConnection(config) {
    var deferred = Promise.pending();

    try {
      var type = config.type;
      type = type.charAt(0).toUpperCase() + type.substring(1);
      var getter = 'create' + type + 'Connection';
      var connection = this[getter](config);

      deferred.resolve(connection);
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  };

  openConnection(config) {
    return this.createConnection(config)
      .then(function(connection) {
        return connection.connect();
      });
  };

  createSftpConnection(config) {
    return new SftpConnection(config);
  };

  createFtpConnection(config) {
    return new FtpConnection(config);
  }
}

