'use strict';
'use babel';

const Exception = require('./Exception');

class ConfigurationFileSyntaxErrorException extends Exception
{
    constructor(message) {
        super(`The configuration file is not well formatted : ${message}`);
    }
}

module.exports = ConfigurationFileSyntaxErrorException;
