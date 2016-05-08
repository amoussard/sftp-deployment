'use strict';
'use babel';

const Exception = require('./Exception');

class TransfertErrorException extends Exception
{
    constructor(file, message) {
        super(`Transfert error with file ${file} : ${message}`);
    }
}

module.exports = TransfertErrorException;
