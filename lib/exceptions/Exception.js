'use strict';
'use babel';

class Exception extends Error
{
    constructor(message) {
        super();

        this.code = null;
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
