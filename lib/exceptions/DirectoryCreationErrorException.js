'use strict';
'use babel';

const Exception = require('./Exception');

class DirectoryCreationErrorException extends Exception
{
    constructor(directory) {
        super(`Cannot create directory ${directory}`);
    }
}

module.exports = DirectoryCreationErrorException;
