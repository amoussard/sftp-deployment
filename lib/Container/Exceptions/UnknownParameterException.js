'use strict';
'use babel';

const Exception = require('./../../Exceptions/Exception');

class UnknownParameterException extends Exception
{
    constructor(parameterName) {
        super(`Unknown parameter: ${parameterName}`);
    }
}

module.exports = UnknownParameterException;
