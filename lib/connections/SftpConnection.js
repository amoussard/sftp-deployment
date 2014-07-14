//////////////////
// Requires
//////////////////

var util = require('util');
var path = require('path');
var Ssh2Connection = require('ssh2');

var Connection = require('./Connection');

//////////////////
// Ctor
//////////////////

function SftpConnection() {
  Connection.apply(this, Array.prototype.slice.call(arguments));
}

util.inherits(SftpConnection, Connection);

//////////////////
// Methods
//////////////////

/**
 * @param  {Config} config
 */
SftpConnection.prototype.init = function(config) {
  var self = this;

  this.config = config;
  this.connection = new Ssh2Connection();

  this.connection.on('error', function(err) {
    self.emit('connection_error', err);
  });

  this.connection.on('end', function() {
    self.emit('connection_end');
  });

  this.connection.on('close', function(had_error) {
    self.emit('connection_close');
  });

  this.connection.on('ready', function() {
    self.emit('connection_ready');
  });

  this.connection.connect(this.config.getConnectionInformations());
};

/**
 * @param  {File[]} aFiles
 */
SftpConnection.prototype.uploadFiles = function (aFiles) {
  var self = this;

  // Open connection
  self.connection.sftp(function(err, sftp) {
    if (err) {
      throw err;
    }

    sftp.on('end', function() {
      self.emit('connection_end');
    });

    aFiles.forEach(function(file) {
      // Beginning prepare
      self.emit('file_upload_begin', file.getPath());

      // Compute paths
      var destinationFile = path.join(self.config.getRemotePath(), file.getPath());
      var destinationDirectory = path.dirname(destinationFile);

      // Create remote directory
      self.emit('create_remote_directory', destinationDirectory);
      self.connection.exec('mkdir -p ' + destinationDirectory, function (err) {
        if (err) {
          self.emit('create_remote_directory_error', destinationDirectory);
          throw err;
        }

        // Beginning of the transfert
        self.emit('file_upload_in_progress', file.getPath());

        // Compute path
        var sourceFile = path.join(atom.project.path, file.getPath());

        // Transfert
        sftp.fastPut(sourceFile, destinationFile, function(err) {
          if (err) {
            self.emit('file_upload_error', file.getPath());
            throw err;
          }
          self.emit('file_upload_success', file.getPath());
          // sftp.end();
        });
      });
    });
  });
};

/**
 * @param  {File[]} aFiles
 */
SftpConnection.prototype.downloadFiles = function (aFiles) {
  var self = this;

  this.connection.sftp(function(err, sftp) {
    if (err) {
      throw err;
    }

    sftp.on('end', function() {
      self.emit('connection_sftp_end');
    });

    aFiles.forEach(function(file) {
      // Beginning prepare
      self.emit('file_download_begin', file.getPath());

      // Compute paths
      var sourceFile = path.join(self.config.getRemotePath(), file.getPath());
      var destinationFile = path.join(atom.project.path, file.getPath());

      // Beginning of the transfert
      self.emit('file_download_in_progress', file.getPath());

      // Transfert
      sftp.fastGet(sourceFile, destinationFile, function(err) {
        if (err) {
          self.emit('file_download_error', file.getPath());
          throw err;
        }
        self.emit('file_download_success', file.getPath());
        // sftp.end();
      });
    });
  });
};

module.exports = SftpConnection;
