//////////////////
// Requires
//////////////////

var path = require('path');

var self;

//////////////////
// Ctor
//////////////////

function File(_path) {
  this.path = _path;
  this.filename = "";
  this.directory = "";

  self = this;
}

//////////////////
// Methods
//////////////////

/**
 * Filename getter
 * @return {String}
 */
File.prototype.getFilename = function () {
    return this.filename;
};

/**
 * Path getter
 * @return {String}
 */
File.prototype.getPath = function () {
    return this.path;
};

/**
 * Directory getter
 * @return {String}
 */
File.prototype.getDirectory = function () {
    return this.directory;
};

module.exports = File;
