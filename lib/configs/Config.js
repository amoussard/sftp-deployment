var self;

//////////////////
// Ctor
//////////////////

function Config() {
  /**
   * @type {String}
   */
  this.type = undefined;

  /**
   * @type {String}
   */
  this.host = "";

  /**
   * @type {String}
   */
  this.username = "";

  /**
   * @type {String}
   */
  this.password = "";

  /**
   * @type {Number}
   */
  this.port = -1;

  /**
   * @type {String}
   */
  this.remotePath = "";

  /**
   * @type {String/Bool}
   */
  this.uploadSave = "false";

  self = this;
}

//////////////////
// Methods
//////////////////

/**
 * Type setter
 * @param {String} _type
 */
Config.prototype.setType = function (_type) {
    self.type = _type;
};

/**
 * Type getter
 */
Config.prototype.getType = function () {
    return self.type;
};

/**
 * Host setter
 * @param {String} _host
 */
Config.prototype.setHost = function (_host) {
    self.host = _host;
};

/**
 * Host getter
 */
Config.prototype.getHost = function () {
    return self.host;
};

/**
 * Username setter
 * @param {String} _username
 */
Config.prototype.setUsername = function (_username) {
    self.username = _username;
};

/**
 * Username getter
 */
Config.prototype.getUsername = function () {
    return self.username;
};

/**
 * Password setter
 * @param {String} _password
 */
Config.prototype.setPassword = function (_password) {
    self.password = _password;
};

/**
 * Password getter
 */
Config.prototype.getPassword = function () {
    return self.password;
};

/**
 * Port setter
 * @param {Number} _port
 */
Config.prototype.setPort = function (_port) {
    self.port = _port;
};

/**
 * Port getter
 */
Config.prototype.getPort = function () {
    return self.port;
};

/**
 * Remote path setter
 * @param {String} _remotePath
 */
Config.prototype.setRemotePath = function (_remotePath) {
    self.remotePath = _remotePath;
};

/**
 * Remote path getter
 */
Config.prototype.getRemotePath = function () {
    return self.remotePath;
};

/**
 * Upload Save setter
 * @param {String} _uploadOnSave
 */
Config.prototype.setUploadSave = function (_uploadOnSave) {
    self.uploadSave = _uploadOnSave;
};

/**
 * Upload Save getter
 */
Config.prototype.getUploadSave = function () {
    return self.uploadSave;
};

Config.prototype.getConnectionInformations = function () {
  throw "You can't instantiate this class";
};

Config.prototype.getDefaultFileContent = function () {
  return '{' +
  '  "type": "sftp",\n' +
  '  "host": "example.com",\n' +
  '  "user": "username",\n' +
  '  "password": "password",\n' +
  '  "port": "22",\n' +
  '  "remote_path": "/example/path",\n' +
  '  "upload_on_save": "false",\n' +
  '  "ssh_key_file": "~/.ssh/id_rsa",\n' +
  '}';
};

module.exports = Config;
