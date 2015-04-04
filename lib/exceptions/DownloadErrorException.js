var util = require('util');

var Exception = require('./Exception');

//////////////////
// Ctor
//////////////////

function DownloadErrorException(file, message) {
    Exception.apply(
        this,
        ['Cannot download file "' + file + '" : ' + message]
    );
}

util.inherits(DownloadErrorException, Exception);

module.exports = DownloadErrorException;
