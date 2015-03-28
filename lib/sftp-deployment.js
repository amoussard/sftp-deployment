var DeploymentManager = require('./DeploymentManager');
var MessageObserver = require('./observers/MessageObserver');
// DEV MODE
var ConsoleObserver = require('./observers/ConsoleObserver');
var manager = new DeploymentManager();
manager.registerObserver(new MessageObserver());
// DEV MODE
manager.registerObserver(new ConsoleObserver());

/**
 * Declare command palette to Atom
 * @type {Object}
 */
module.exports = {
    activate: function() {
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:mapToRemote',
            manager.generateConfigFile
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:uploadCurrentFile',
            manager.uploadCurrentFile
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:downloadCurrentFile',
            manager.downloadCurrentFile
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:uploadOpenFiles',
            manager.uploadOpenFiles
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:uploadSelection',
            manager.uploadSelection
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:downloadSelection',
            manager.downloadSelection
        );
        // atom.commands.add(
        //     'atom-workspace',
        //     'core:save',
        //     manager.uploadCurrentFileOnSave
        // );
    }
};
