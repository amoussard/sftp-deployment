'use strict';
'use babel';

const Exception = require('./Exception');

class DownloadErrorException extends Exception
{
    constructor(file, message) {
        super(`Cannot download file ${file} : ${message}`);
    }
}

module.exports = DownloadErrorException;
