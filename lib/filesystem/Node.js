//////////////////
// Requires
//////////////////

var path = require('path');

//////////////////
// Ctor
//////////////////

function Node(_path, relative) {
    if (atom.project.rootDirectories.length < 1) {
        throw "project_not_found";
    }

    if (relative) {
        this.path = path.join(
            atom.project.rootDirectories[0].path,
            _path
        );
        this.relativePath = _path;
    } else {
        this.path = _path;
        this.relativePath = path.relative(
            atom.project.rootDirectories[0].path,
            _path
        );
    }
}

//////////////////
// Methods
//////////////////

/**
 * Path getter
 * @return {String}
 */
 Node.prototype.getPath = function () {
    return this.path;
};

/**
 * Relative path getter
 * @return {String}
 */
 Node.prototype.getRelativePath = function () {
    return this.relativePath;
};

module.exports = Node;
