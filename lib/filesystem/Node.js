'use strict';
'use babel';

const path = require('path');

class Node
{
    constructor(_path, relative) {
        // @TODO: Fix the #101 bug
        if (atom.project.rootDirectories.length < 1) {
            throw 'project_not_found';
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

    getPath() {
        return this.path;
    }

    getRelativePath() {
        return this.relativePath;
    }
}

module.exports = Node;
