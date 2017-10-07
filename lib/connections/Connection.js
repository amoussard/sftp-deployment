"use babel";

import * as process from "child_process";
import Promise from "bluebird";
import Queue from "./../queue/Queue";
import ConnectionErrorException from "./../exceptions/ConnectionErrorException";
import DirectoryCreationErrorException from "./../exceptions/DirectoryCreationErrorException";
import RemoteDirectoryNotReadableException from "./../exceptions/RemoteDirectoryNotReadableException";

const {exec} = process;

export default class Connection {
  constructor(config = null) {
    this.config = config;
    this.connection = null;
    this.queue = new Queue(3);
  }

  getConnectionInformations() {
    throw "Method not implemented";
  }

  createRemoteDirectory() {
    throw "Method not implemented";
  }

  createDirectory(directoryPath) {
    const deferred = Promise.pending();

    try {
      exec(
        "mkdir -p " + directoryPath,
        (err) => {
          if (err) {
            deferred.reject(new DirectoryCreationErrorException(directoryPath));

            return;
          }

          deferred.resolve(directoryPath);
        }
      );
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  uploadFile() {
    throw "Method non implemented";
  }

  downloadFile() {
    throw "Method non implemented";
  }

  connect() {
    const deferred = Promise.pending();

    this.connection.on("ready", () => {
      deferred.resolve(this);
    });

    this.connection.on("error", (err) => {
      deferred.reject(new ConnectionErrorException(err.message));
    });

    try {
      this.connection.connect(this.getConnectionInformations());
    } catch (e) {
      deferred.reject(new ConnectionErrorException(e.message));
    }

    return deferred.promise;
  }

  close() {
    const deferred = Promise.pending();

    try {
      this.connection.end();
      deferred.resolve(true);
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  upload(files) {
    const deferred = Promise.pending();

    try {
      files.forEach((file) => {
        this.queue.addAction(() => this.uploadFile(file));
      });

      this.queue.execute(
        () => {
          deferred.resolve(this);
        },
        (e) => {
          deferred.reject(e);
        }
      );
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  download(files) {
    const deferred = Promise.pending();

    try {
      files.forEach((file) => {
        this.queue.addAction(() => this.downloadFile(file));
      });

      this.queue.execute(
        () => {
          deferred.resolve(this);
        },
        (e) => {
          deferred.reject(e);
        }
      );
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  extractDistantFiles() {
    //
  }

  getTargetFiles(nodes) {
    const deferred = Promise.pending();

    const files = [];

    try {
      const calls = nodes.map((node) => this.extractDistantFiles(node, files));

      Promise.all(calls).
        then(() => {
          deferred.resolve(files);
        }).
        catch(RemoteDirectoryNotReadableException, (e) => {
          deferred.reject(e);
        });
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }
}

