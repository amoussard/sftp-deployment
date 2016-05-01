'use strict';
'use babel';

const Exception = require('./Exception');

class ConnectionErrorException extends Exception
{
    constructor(message) {
        super(`Cannot established connection : ${message}`);
    }
}

module.exports = ConnectionErrorException;
