'use strict';
'use babel';

const Exception = require('./Exception');

class RemoteDirectoryNotReadableException extends Exception
{
    constructor(directory) {
        super(`The remote directory ${directory} is not readable.`);
    }
}

module.exports = RemoteDirectoryNotReadableException;
