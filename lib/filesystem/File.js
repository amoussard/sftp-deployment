//////////////////
// Requires
//////////////////

var path = require('path');

var self;

//////////////////
// Ctor
//////////////////

function File(path) {
  this.path = path;
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
    return self.filename;
};

/**
 * Path getter
 * @return {String}
 */
File.prototype.getPath = function () {
    return self.path;
};

/**
 * Directory getter
 * @return {String}
 */
File.prototype.getDirectory = function () {
    return self.directory;
};

module.exports = File;
