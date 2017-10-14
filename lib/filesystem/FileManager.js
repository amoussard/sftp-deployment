"use babel";

/* global atom */

import * as fs from "fs";
import * as path from "path";
import Promise from "bluebird";

import File from "./File";

export default class FileManager {
  static getCurrentFile() {
    const deferred = Promise.pending();

    try {
      deferred.fulfill(new File(atom.workspace.getCenter().paneContainer.activePane.activeItem.buffer.file.path));
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  static getOpenFiles() {
    const deferred = Promise.pending();

    try {
      const items = atom.workspace.getActivePane().getItems();
      const files = items.map((item) => new File(item.buffer.file.path));

      deferred.fulfill(files);
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }

  static getSelection() {
    const deferred = Promise.pending();

    try {
      const selectedPaths = atom.workspace.getActivePaneItem().selectedPaths();
      const files = [];

      selectedPaths.forEach((p) => {
        treatPath(p, files);
      });

      deferred.resolve(files);
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }
}

function treatPath(_path, results) {
  const stats = fs.statSync(_path); // eslint-disable-line no-sync

  if (stats.isDirectory()) {
    const files = fs.readdirSync(_path); // eslint-disable-line no-sync

    files.forEach((file) => {
      treatPath(path.join(_path, file), results);
    });
  } else if (results.indexOf(_path) < 0) {
    results.push(new File(_path));
  }
}

