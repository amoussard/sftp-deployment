//////////////////
// Requires
//////////////////

var util = require('util');
var path = require('path');
var Ssh2Connection = require('ssh2');

var Connection = require('./Connection');
var oFileManager = require('../filesystem/FileManager');

var self;

//////////////////
// Ctor
//////////////////

function SftpConnection() {
  Connection.apply(this, Array.prototype.slice.call(arguments));

  this.sftp = null;

  self = this;
}

util.inherits(SftpConnection, Connection);

//////////////////
// Methods
//////////////////

/**
 * @param  {Config} config
 */
SftpConnection.prototype.init = function(config) {
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

  self.connection.connect(self.config.getConnectionInformations());
};

/**
 * @param  {File[]} aFiles
 */
SftpConnection.prototype.uploadFiles = function (aFiles) {
  self.nbFiles = aFiles.length;

  self.connection.sftp(function(err, sftp) {
    if (err)
      throw err;

    sftp.on('end', function() {
      self.emit('connection_sftp_end');
    });

    aFiles.forEach(function(file) {
      var destinationFile = oFileManager.winToLin(path.join(self.config.getRemotePath(), file.getPath()));
      var destinationDirectory = path.dirname(destinationFile);

      self.emit('sftp_mkdir', destinationDirectory);
      self.connection.exec('mkdir -p ' + destinationDirectory, function (err) {
        if (err) {
          self.emit('sftp_mkdir_upload_file_error', destinationDirectory);
          throw err;
        }

        var sourceFile = path.join(atom.project.path, file.getPath());
        self.emit('sftp_upload_file', file.getPath());
        sftp.fastPut(sourceFile, destinationFile, function(err) {
          if (err) {
            self.emit('sftp_upload_file_error', file.getPath());
            throw err;
          }
          self.emit('sftp_upload_file_success', file.getPath());
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
  self.nbFiles = aFiles.length;

  self.connection.sftp(function(err, sftp) {
    if (err)
      throw err;

    sftp.on('end', function() {
      self.emit('connection_sftp_end');
    });

    aFiles.forEach(function(file) {
      var sourceFile = oFileManager.winToLin(path.join(self.config.getRemotePath(), file.getPath()));
      var destinationFile = path.join(atom.project.path, file.getPath());
      self.emit('sftp_download_file', file.getPath());
      sftp.fastGet(sourceFile, destinationFile, function(err) {
        if (err) {
          self.emit('sftp_download_file_error', file.getPath());
          throw err;
        }
        self.emit('sftp_download_file_success', file.getPath());
        sftp.end();
      });
    });
  });
};

module.exports = SftpConnection;
