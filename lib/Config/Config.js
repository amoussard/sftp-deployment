'use strict';
'use babel';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const CONFIG_FILE_INDENTATION = 4;

class Config
{
    constructor() {
        this.type = 'generic';
        this.host = '';
        this.username = '';
        this.password = '';
        this.port = -1;
        this.remotePath = '';
        this.uploadOnSave = false;
        this.uploadConfigFile = false;
    }

    setType(_type) {
        this.type = _type;
    }

    getType() {
        return this.type;
    }

    setHost(_host) {
        this.host = _host;
    }

    getHost() {
        return this.host;
    }

    setUsername(_username) {
        this.username = _username;
    }

    getUsername() {
        return this.username;
    }

    setPassword(_password) {
        this.password = _password;
    }

    getPassword() {
        return this.password;
    }

    setPort(_port) {
        this.port = _port;
    }

    getPort() {
        return this.port;
    }

    setRemotePath(_remotePath) {
        this.remotePath = _remotePath;
    }

    getRemotePath() {
        return this.remotePath;
    }

    setUploadOnSave(_uploadOnSave) {
        this.uploadOnSave = _uploadOnSave;
    }

    getUploadOnSave() {
        return this.uploadOnSave;
    }

    setUploadConfigFile(_uploadConfigFile) {
        this.uploadConfigFile = _uploadConfigFile;
    }

    getUploadConfigFile() {
        return this.uploadConfigFile;
    }

    static _replacer(key, value) {
        return value !== null ? value : undefined;
    }

    save(path) {
        return fs.writeFileAsync(
            path,
            JSON.stringify(this, this._replacer, CONFIG_FILE_INDENTATION)
        );
    }
}

module.exports = Config;
