'use strict';
'use babel';

const Exception = require('./Exception');

class RemoteDirectoryCreationErrorException extends Exception
{
    constructor(directory) {
        super(`Cannot create remote directory ${directory}`);
    }
}

module.exports = RemoteDirectoryCreationErrorException;
