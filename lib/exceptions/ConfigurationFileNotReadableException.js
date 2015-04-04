var util = require('util');

var Exception = require('./Exception');

//////////////////
// Ctor
//////////////////

function ConfigurationFileNotReadableException() {
    Exception.apply(this, ['The configuration file is not readable.']);
}

util.inherits(ConfigurationFileNotReadableException, Exception);

module.exports = ConfigurationFileNotReadableException;
