"use babel";

import * as child_process from "child_process";
import Promise from "bluebird";
import Queue from "./../queue/Queue";
import Action from "./../queue/Action";
import Directory from "./../filesystem/Directory";
import ConnectionErrorException from "./../exceptions/ConnectionErrorException";
import DirectoryCreationErrorException from "./../exceptions/DirectoryCreationErrorException";
import RemoteDirectoryNotReadableException from "./../exceptions/RemoteDirectoryNotReadableException";

const exec = child_process.exec;

export default class Connection {
  constructor(config = null) {
    this.config = config;
    this.connection = null;
    this.queue = new Queue(3);
  }

  getConnectionInformations() {
    throw "Method not implemented";
  }

  createRemoteDirectory(directoryPath) {
    throw "Method not implemented";
  }

  createDirectory(directoryPath) {
    var deferred = Promise.pending();

    try {
      exec(
        'mkdir -p ' + directoryPath,
        (err) => {
          if (err) {
            deferred.reject(new DirectoryCreationErrorException(directoryPath));
            return;
          }

          deferred.resolve(directoryPath);
        }
      );
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  uploadFile(file) {
    throw "Method non implemented";
  }

  downloadFile(file) {
    throw "Method non implemented";
  }

  connect() {
    var self = this;
    var deferred = Promise.pending();

    this.connection.on('ready', () => {
      deferred.resolve(self);
    });

    this.connection.on('error', (err) => {
      deferred.reject(new ConnectionErrorException(err.message));
    });

    try {
      this.connection.connect(this.getConnectionInformations());
    } catch(e) {
      deferred.reject(new ConnectionErrorException(e.message));
    }

    return deferred.promise;
  }

  close() {
    var deferred = Promise.pending();

    try {
      this.connection.end();
      deferred.resolve(true);
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  upload(files) {
    var self = this;
    var deferred = Promise.pending();

    try {
      for (var i in files) {
        this.queue.addAction(new Action(
          self,
          self.uploadFile,
          [files[i]]
        ));
      }

      this.queue.execute(
        () => {
          deferred.resolve(self);
        },
        (e) => {
          deferred.reject(e);
        }
      );
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  download(files) {
    var self = this;
    var deferred = Promise.pending();

    try {
      for (var i in files) {
        this.queue.addAction(new Action(
          self,
          self.downloadFile,
          [files[i]]
        ));
      }

      this.queue.execute(
        () => {
          deferred.resolve(self);
        },
        (e) => {
          deferred.reject(e);
        }
      );
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  extractDistantFiles(node, files) {
  }

  getTargetFiles(nodes) {
    var self = this;
    var deferred = Promise.pending();

    var files = [];
    var calls = [];

    try {
      for (var i in nodes) {
        var node = nodes[i];
        calls.push(this.extractDistantFiles(node, files));
      }

      Promise.all(calls)
        .then(() => {
          deferred.resolve(files);
        })
        .catch(RemoteDirectoryNotReadableException, (e) => {
          deferred.reject(e);
        });
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }
}

