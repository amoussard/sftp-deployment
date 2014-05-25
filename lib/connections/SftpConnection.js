//////////////////
// Requires
//////////////////

var util = require('util');
var path = require('path');

var Connection = require('./Connection');

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
 *
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
      var destinationFile = path.join(self.config.getDestinationFolder(), file.getPath());
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
          sftp.end();
        });
      });
    });
  });
};

module.exports = SftpConnection;
