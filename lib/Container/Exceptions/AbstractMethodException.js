'use strict';
'use babel';

const Exception = require('./../../Exceptions/Exception');

class AbstractMethodException extends Exception
{
    constructor() {
        super('This method is abstract, it can not be called directly.');
    }
}

module.exports = AbstractMethodException;
