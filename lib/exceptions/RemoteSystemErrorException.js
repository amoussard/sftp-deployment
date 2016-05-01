var util = require('util');

var Exception = require('./Exception');

//////////////////
// Ctor
//////////////////

function RemoteSystemErrorException(msg) {
    Exception.apply(
        this,
        ['Remote System Error: "' + msg + '"']
    );
}

util.inherits(RemoteSystemErrorException, Exception);

module.exports = RemoteSystemErrorException;
