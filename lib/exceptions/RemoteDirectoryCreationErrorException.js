var util = require('util');

var Exception = require('./Exception');

//////////////////
// Ctor
//////////////////

function RemoteDirectoryCreationErrorException(directory) {
    Exception.apply(
        this,
        ['Cannot create remote directory "' + directory + '"']
    );
}

util.inherits(RemoteDirectoryCreationErrorException, Exception);

module.exports = RemoteDirectoryCreationErrorException;
