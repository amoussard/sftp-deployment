var util = require('util');

var Exception = require('./Exception');

//////////////////
// Ctor
//////////////////

function TransfertErrorException(file, message) {
    Exception.apply(
        this,
        ['Transfert error with file "' + file + '" : ' + message]
    );
}

util.inherits(TransfertErrorException, Exception);

module.exports = TransfertErrorException;
