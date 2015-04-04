var util = require('util');

var Exception = require('./Exception');

//////////////////
// Ctor
//////////////////

function NoConfigurationFileFoundException() {
    Exception.apply(this, ['No configuration file found.']);
}

util.inherits(NoConfigurationFileFoundException, Exception);

module.exports = NoConfigurationFileFoundException;
