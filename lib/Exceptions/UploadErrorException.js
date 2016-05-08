'use strict';
'use babel';

const Exception = require('./Exception');

class UploadErrorException extends Exception
{
    constructor(file, message) {
        super(`Cannot upload file ${file} : ${message}`);
    }
}

module.exports = UploadErrorException;
