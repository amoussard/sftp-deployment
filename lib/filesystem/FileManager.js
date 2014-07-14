//////////////////
// Requires
//////////////////

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var path = require('path');
var dir = require('node-dir');

var File = require('./File');

//////////////////
// Ctor
//////////////////

function FileManager() {
  this.stack = [];
  this.results = [];
}

util.inherits(FileManager, EventEmitter);

//////////////////
// Methods
//////////////////

/**
 * Reset object attributes
 */
FileManager.prototype.clear = function() {
  this.stack = [];
  this.results = [];
};

/**
 * Add file on the treatment stack
 * @param {string} sFile
 */
FileManager.prototype.addToStack = function(sFile) {
  this.stack.push(sFile);
};

/**
 * Treat file
 */
FileManager.prototype.manageNextFile = function() {
  var self = this;
  var file = this.stack.pop();

  if (fs.lstatSync(file).isFile()) {
    this.emit("file_treat", [file]);
  } else {
    dir.readFiles(file,
      function(err, content, next) {
        if (err) throw err;
        next();
      },
      function(err, files){
        if (err) throw err;
        self.emit("file_treat", files);
      }
    );
  }
};

/**
 * Get the file of current open tab
 */
FileManager.prototype.getCurrentFile = function() {
  this.addToStack(atom.workspace.activePaneItem.buffer.file.path);

  this.manageNextFile();
};

/**
 * Get the files of open tabs
 * @return {File[]}
 */
FileManager.prototype.getOpenFiles = function() {
  var items = atom.workspace.getActivePane().getItems();
  for (var i in items) {
    this.addToStack(items[i].buffer.file.path);
  }

  this.manageNextFile();
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

FileManager.prototype.winToLin() = function(sPath) {
  return sPath.replace(/\\/g, '/');
};

//////////////////
// Events
//////////////////

FileManager.prototype.on("file_treat", function(aFiles) {
  this.results = this.results.concat(aFiles);
  if (this.stack.length === 0) {
    this.emit('prepare', this.results);
  } else {
    this.manageNextFile();
  }
});

FileManager.prototype.on("prepare", function(aFiles) {
  var res = [];
  aFiles.forEach(function(file) {
    res.push(new File(path.relative(atom.project.path, file)));
  });
  this.clear();
  this.emit("files_ready", res);
});

module.exports = new FileManager();
