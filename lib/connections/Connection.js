//////////////////
// Requires
//////////////////

var Ssh2Connection = require('ssh2');
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
  self.config = config;
  self.connection = new Ssh2Connection();

  self.connection.on('error', function(err) {
    self.emit('connection_error', err);
  });

  self.connection.on('end', function() {
    self.emit('connection_end');
  });

  self.connection.on('close', function(had_error) {
    self.emit('connection_close');
  });

  self.connection.on('ready', function() {
    self.emit('connection_ready');
  });

  self.connection.connect(self.config);
};

module.exports = Connection;
