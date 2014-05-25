//////////////////
// Requires
//////////////////

var Connection = require('./Connection');
var util = require('util');

var self;

//////////////////
// Ctor
//////////////////

function FtpConnection() {
  Connection.apply(this, Array.prototype.slice.call(arguments));

  this.ftp = null;

  self = this;
}

util.inherits(FtpConnection, Connection);

//////////////////
// Methods
//////////////////

/**
 *
 */
FtpConnection.prototype.uploadFiles = function (aFiles) {

};

module.exports = FtpConnection;
