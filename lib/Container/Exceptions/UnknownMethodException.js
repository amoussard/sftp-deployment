'use strict';
'use babel';

const Exception = require('./../../Exceptions/Exception');

class UnknownMethodException extends Exception
{
    constructor(className, method) {
        super(`Unknown method: ${className}:${method}`);
    }
}

module.exports = UnknownMethodException;
