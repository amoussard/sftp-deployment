'use strict';
'use babel';

class Exception extends Error
{
    constructor(message, code) {
        super();

        this.code = code;
        this.message = message;
    }

    getMessage() {
        return this.message;
    }

    getCode() {
        return this.code;
    }
}

module.exports = Exception;
