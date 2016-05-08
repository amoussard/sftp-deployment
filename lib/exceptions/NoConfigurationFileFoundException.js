'use strict';
'use babel';

const Exception = require('./Exception');

class NoConfigurationFileFoundException extends Exception
{
    constructor() {
        super('No configuration file found.', 'no_configuration_file_found');
    }
}

module.exports = NoConfigurationFileFoundException;
