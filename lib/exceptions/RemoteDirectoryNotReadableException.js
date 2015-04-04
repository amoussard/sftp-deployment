var util = require('util');

var Exception = require('./Exception');

//////////////////
// Ctor
//////////////////

function RemoteDirectoryNotReadableException(directory) {
    Exception.apply(this, ['The remote directory "' + directory + '" is not readable.']);
}

util.inherits(RemoteDirectoryNotReadableException, Exception);

module.exports = RemoteDirectoryNotReadableException;
