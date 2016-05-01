'use strict';
'use babel';

const Exception = require('./Exception');

class NoConfigurationFileFoundException extends Exception
{
    constructor() {
        super('No configuration file found.');
    }
}

module.exports = NoConfigurationFileFoundException;
