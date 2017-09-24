"use babel";

import * as fs from "fs";
import * as path from "path";
import Promise from "bluebird";

import File from "./File";
import Directory from "./Directory";

export default class FileManager {
  static getCurrentFile() {
    var deferred = Promise.pending();

    try {
      deferred.fulfill(new File(atom.workspace.getCenter().paneContainer.activePane.activeItem.buffer.file.path));
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  };

  static getOpenFiles() {
    var deferred = Promise.pending();

    try {
      var files = [];
      var items = atom.workspace.getActivePane().getItems();
      for (var i in items) {
        files.push(new File(items[i].buffer.file.path));
      }
      deferred.fulfill(files);
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  };

  static getSelection() {
    var deferred = Promise.pending();

    try {
      var selectedPaths = atom.workspace.getActivePaneItem().selectedPaths();
      var files = [];
      for (var i in selectedPaths) {
        treatPath(selectedPaths[i], files);
      }
      deferred.resolve(files);
    } catch(e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }
}

const treatPath = (_path, results) => {
  var stats = fs.statSync(_path);

  if (stats.isDirectory()) {
    var files = fs.readdirSync(_path);
    for (var i in files) {
      treatPath(path.join(_path, files[i]), results);
    }
  } else {
    if (results.indexOf(_path) < 0) {
      results.push(new File(_path));
    }
  }
}

