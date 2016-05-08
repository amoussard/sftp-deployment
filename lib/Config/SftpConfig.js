'use strict';
'use babel';

const fs = require('fs');
const expandHomeDir = require('expand-home-dir')

const Config = require('./Config');

class SftpConfig extends Config {
    constructor() {
        super();

        this.type = 'sftp';
        this.port = 22;
        this.sshKeyFile = null;
        this.passphrase = null;
    }

    setSshKeyFile(_key) {
        this.sshKeyFile = _key;
    }

    getSshKeyFile() {
        return fs.readFileSync(expandHomeDir(this.sshKeyFile), 'utf8');
    }

    setPassphrase(_passphrase) {
        this.passphrase = _passphrase;
    }

    getPassphrase() {
        return this.passphrase;
    }
}

module.exports = SftpConfig;
