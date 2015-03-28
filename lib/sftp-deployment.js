var DeploymentManager = require('./DeploymentManager');
var MessageObserver = require('./observers/MessageObserver');
// DEV MODE
var ConsoleObserver = require('./observers/ConsoleObserver');
var manager = new DeploymentManager();
manager.registerObserver(new MessageObserver());
// DEV MODE
manager.registerObserver(new ConsoleObserver());

module.exports = {
  activate: function() {
    atom.workspaceView.command(
      'sftp-deployment:mapToRemote', manager.generateConfigFile
    );
    atom.workspaceView.command(
      'sftp-deployment:uploadCurrentFile', manager.uploadCurrentFile
    );
    atom.workspaceView.command(
      'sftp-deployment:downloadCurrentFile', manager.downloadCurrentFile
    );
    atom.workspaceView.command(
      'sftp-deployment:uploadOpenFiles', manager.uploadOpenFiles
    );
    atom.workspaceView.command(
      'sftp-deployment:uploadSelection', manager.uploadSelection
    );
    atom.workspaceView.command(
      'sftp-deployment:downloadSelection', manager.downloadSelection
    );
    atom.workspaceView.command(
      'core:save', manager.uploadCurrentFileOnSave
    );
  }
};
