'use strict';
'use babel';

const Exception = require('./Exception');

class RemoteSystemErrorException extends Exception
{
    constructor(message) {
        super(`Remote System Error: ${message}`);
    }
}

module.exports = RemoteSystemErrorException;
