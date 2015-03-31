//////////////////
// Requires
//////////////////

var path = require('path');
var util = require('util');

var Node = require('./Node');

//////////////////
// Ctor
//////////////////

function File(_path, relative) {
    Node.apply(this, [_path, relative]);
}
util.inherits(File, Node);

//////////////////
// Methods
//////////////////

/**
 * Filename getter
 * @return {String}
 */
File.prototype.getFilename = function () {
    return path.basename(this.path);
};

/**
 * Directory getter
 * @return {String}
 */
File.prototype.getDirectory = function () {
    return path.dirname(this.path);
};

module.exports = File;
