'use strict';
'use babel';

const path = require('path');

const Node = require('./Node');

class File extends Node {
    getFilename() {
        return path.basename(this.path);
    }

    getDirectory() {
        return path.dirname(this.path);
    }
}

module.exports = File;
