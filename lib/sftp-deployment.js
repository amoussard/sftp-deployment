var SFTP = require('./SFTP');

module.exports = {
  activate: function() {
    atom.workspaceView.command(
      'sftp-deployment:mapToRemote', SFTP.mapToRemote
    );
    atom.workspaceView.command(
      'sftp-deployment:uploadCurrentFile', SFTP.uploadCurrentFile
    );
    atom.workspaceView.command(
      'sftp-deployment:downloadCurrentFile', SFTP.downloadCurrentFile
    );
    atom.workspaceView.command(
      'sftp-deployment:uploadOpenFiles', SFTP.uploadOpenFiles
    );
  }
};
