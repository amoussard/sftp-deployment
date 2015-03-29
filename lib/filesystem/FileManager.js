//////////////////
// Requires
//////////////////

var Promise = require('bluebird');
var util = require('util');
var fs = require('fs');
var path = require('path');

var File = require('./File');

//////////////////
// Ctor
//////////////////

function FileManager() {
}

//////////////////
// Methods
//////////////////

/**
 * Get the file of current open tab
 */
FileManager.prototype.getCurrentFile = function() {
    var deferred = Promise.pending();

    try {
        deferred.fulfill(new File(atom.workspace.activePaneItem.buffer.file.path));
    } catch(e) {
        deferred.reject(e);
    }

    return deferred.promise;
};

/**
 * Get the files of open tabs
 * @return {File[]}
 */
FileManager.prototype.getOpenFiles = function() {
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

/**
 * Get the files of open tabs
 * @return {File[]}
 */
FileManager.prototype.getSelection = function() {
  var self = this;
  var $ = require('atom').$;

  $(".tree-view .selected").each(function () {
    self.addToStack($(this).view().getPath());
  });

  this.manageNextFile();
};

module.exports = new FileManager();
