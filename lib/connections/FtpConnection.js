//////////////////
// Requires
//////////////////

var util = require('util');
var path = require('path');
var fs = require('fs');
var connection = require('ftp');

var Connection = require('./Connection');

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
 * @TODO: set the events
 * @param  {Config} config
 */
FtpConnection.prototype.init = function(config) {
  self.config = config;
  self.connection = new connection();

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

  self.connection.connect(self.config.getConnectionInformations());
};

/**
 * @param  {File[]} aFiles
 */
FtpConnection.prototype.uploadFiles = function (aFiles) {
  self.nbFiles = aFiles.length;

  aFiles.forEach(function(file) {
    var destinationFile = path.join(self.config.getRemotePath(), file.getPath());
    var destinationDirectory = path.dirname(destinationFile);

    self.emit('ftp_mkdir', destinationDirectory);
    self.connection.mkdir(destinationDirectory, true, function (err) {
      if (err) {
        self.emit('ftp_mkdir_upload_file_error', destinationDirectory);
        throw err;
      }

      var sourceFile = path.join(atom.project.path, file.getPath());
      self.emit('ftp_upload_file', file.getPath());
      self.connection.put(sourceFile, destinationFile, function(err) {
        if (err) {
          self.emit('ftp_upload_file_error', file.getPath());
          throw err;
        }
        self.emit('ftp_upload_file_success', file.getPath());
        self.connection.end();
      });
    });
  });
};

/**
 * @param  {File[]} aFiles
 */
FtpConnection.prototype.downloadFiles = function (aFiles) {
  self.nbFiles = aFiles.length;

  aFiles.forEach(function(file) {
    var sourceFile = path.join(self.config.getRemotePath(), file.getPath());
    var destinationFile = path.join(atom.project.path, file.getPath());
    self.emit('ftp_download_file', file.getPath());
    self.connection.get(sourceFile, function(err, stream) {
      if (err) {
        self.emit('ftp_download_file_error', file.getPath());
        throw err;
      }
      stream.once('close', function() {
        self.emit("connection_ftp_end");
        self.connection.end();
      });
      stream.pipe(fs.createWriteStream(destinationFile));

      self.emit('ftp_download_file_success', file.getPath());
    });
  });
};

module.exports = FtpConnection;
