'use strict';
'use babel';

const Exception = require('./Exception');

class ConfigurationFileNotReadableException extends Exception
{
    constructor() {
        super('The configuration file is not readable.');
    }
}

module.exports = ConfigurationFileNotReadableException;
