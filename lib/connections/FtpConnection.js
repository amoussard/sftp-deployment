//////////////////
// Requires
//////////////////

var util = require('util');
var path = require('path');
var fs = require('fs');
var connection = require('ftp');

var Connection = require('./Connection');

//////////////////
// Ctor
//////////////////

function FtpConnection() {
  Connection.apply(this, Array.prototype.slice.call(arguments));
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
  var self = this;
  
  aFiles.forEach(function(file) {
    // Beginning prepare
    self.emit('file_upload_begin', file.getPath());

    // Compute paths
    var destinationFile = path.join(self.config.getRemotePath(), file.getPath());
    var destinationDirectory = path.dirname(destinationFile);

    // Create remote directory
    self.emit('create_remote_directory', destinationDirectory);
    self.connection.mkdir(destinationDirectory, true, function (err) {
      if (err) {
        self.emit('create_remote_directory_error', destinationDirectory);
        throw err;
      }

      // Beginning of the transfert
      self.emit('file_upload_in_progress', file.getPath());

      // Compute path
      var sourceFile = path.join(atom.project.path, file.getPath());

      // Transfert
      self.connection.put(sourceFile, destinationFile, function(err) {
        if (err) {
          self.emit('file_upload_error', file.getPath());
          throw err;
        }

        // Transfert complete
        self.emit('file_upload_success', file.getPath());
        self.connection.end();
      });
    });
  });
};

/**
 * @param  {File[]} aFiles
 */
FtpConnection.prototype.downloadFiles = function (aFiles) {
  var self = this;

  aFiles.forEach(function(file) {
    // Beginning prepare
    self.emit('file_download_begin', file.getPath());

    // Compute paths
    var sourceFile = path.join(self.config.getRemotePath(), file.getPath());
    var destinationFile = path.join(atom.project.path, file.getPath());

    // Beginning of the transfert
    self.emit('file_download_in_progress', file.getPath());

    // Transfert
    self.connection.get(sourceFile, function(err, stream) {
      if (err) {
        self.emit('file_download_error', file.getPath());
        throw err;
      }
      stream.once('close', function() {
      });
      stream.pipe(fs.createWriteStream(destinationFile));

      // Transfert complete
      self.emit('file_download_success', file.getPath());
    });
  });
};

module.exports = FtpConnection;
