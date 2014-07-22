//////////////////
// Requires
//////////////////

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var self;

//////////////////
// Ctor
//////////////////

function Connection() {
  this.config = null;
  this.connection = null;
  this.nbFiles = 0;

  self = this;
}

util.inherits(Connection, EventEmitter);

//////////////////
// Methods
//////////////////

/**
 * @param  {Config} config
 */
Connection.prototype.init = function(config) {
};

/**
 * @param  {File[]} aFiles
 */
Connection.prototype.uploadFiles = function (aFiles) {
};

/**
 * @param  {File[]} aFiles
 */
Connection.prototype.downloadFiles = function (aFiles) {
};

/**
 * @param {String} sPath
 */
Connection.prototype.normalizePath = function (sPath) {
  return sPath.replace(/\\/g, '/');
};

module.exports = Connection;
