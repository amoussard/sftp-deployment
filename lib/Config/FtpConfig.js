'use strict';
'use babel';

const Config = require('./Config');

class FtpConfig extends Config
{
    constructor() {
        super();

        this.type = 'ftp';
        this.port = 21;
    }
}

module.exports = FtpConfig;
