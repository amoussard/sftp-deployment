'use strict';
'use babel';

const Exception = require('./../../Exceptions/Exception');

class FileNotFoundException extends Exception
{
    constructor(filePath) {
        super(`There is no file with the path: ${filePath}`);
    }
}

module.exports = FileNotFoundException;
