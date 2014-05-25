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
  this.host = "localhost";

  /**
   * @type {String}
   */
  this.username = "username";

  /**
   * @type {String}
   */
  this.password = "secret";

  /**
   * @type {Number}
   */
  this.port = -1;

  /**
   * @type {String}
   */
  this.destinationFolder = "/path/to/your/remote/project/home";
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
 * Destination folder setter
 * @param {String} _destinationFolder
 */
Config.prototype.setDestinationFolder = function (_destinationFolder) {
    self.destinationFolder = _destinationFolder;
};

/**
 * Destination folder getter
 */
Config.prototype.getDestinationFolder = function () {
    return self.destinationFolder;
};

Config.prototype.getConnectionInformations = function () {
  throw "You can't instantiate this class";
};

module.exports = Config;
