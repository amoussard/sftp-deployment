'use strict';
'use babel';

const Exception = require('./../../Exceptions/Exception');

class UnknownServiceException extends Exception
{
    constructor(serviceName) {
        super(`Unknown service: ${serviceName}`);
    }
}

module.exports = UnknownServiceException;
