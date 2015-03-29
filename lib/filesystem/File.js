//////////////////
// Requires
//////////////////

var path = require('path');

//////////////////
// Ctor
//////////////////

function File(_path) {
    if (atom.project.rootDirectories.length < 1) {
        throw "project_not_found";
    }

    this.path = _path;
    this.relativePath = path.relative(
        atom.project.rootDirectories[0].path,
        _path
    );
    this.filename = path.basename(this.path);
    this.directory = path.dirname(this.path);
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
 * Relative path getter
 * @return {String}
 */
File.prototype.getRelativePath = function () {
    return this.relativePath;
};

/**
 * Directory getter
 * @return {String}
 */
File.prototype.getDirectory = function () {
    return this.directory;
};

module.exports = File;
