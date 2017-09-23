var DeploymentManager = require('./DeploymentManager');
var MessageObserver = require('./observers/MessageObserver');
// DEV MODE
//var ConsoleObserver = require('./observers/ConsoleObserver');
var manager = new DeploymentManager();
manager.registerObserver(new MessageObserver());
// DEV MODE
//manager.registerObserver(new ConsoleObserver());

/**
 * Declare command palette to Atom
 * @type {Object}
 */
module.exports = {
    'config': {
        'uploadOnSave': {
            'title': 'Upload on save',
            'description': 'When enabled, remote files will be automatically uploaded when saved',
            'type': 'boolean',
            'default': true
        },
        'messagePanel': {
            'title': 'Display message panel',
            'type': 'boolean',
            'default': true
        },
        'sshPrivateKeyPath': {
            'title': 'Path to private SSH key',
            'type': 'string',
            'default': '~/.ssh/id_rsa'
        },
        'messagePanelTimeout': {
            'title': 'Timeout for message panel',
            'type': 'integer',
            'default': 6000
        }
    },

    activate: function() {
        atom.commands.add(
            'atom-workspace',
            'atom-sftp-sync:mapToRemote',
            manager.generateConfigFile
        );
        atom.commands.add(
            'atom-workspace',
            'atom-sftp-sync:uploadCurrentFile',
            manager.uploadCurrentFile
        );
        atom.commands.add(
            'atom-workspace',
            'atom-sftp-sync:downloadCurrentFile',
            manager.downloadCurrentFile
        );
        atom.commands.add(
            'atom-workspace',
            'atom-sftp-sync:uploadOpenFiles',
            manager.uploadOpenFiles
        );
        atom.commands.add(
            'atom-workspace',
            'atom-sftp-sync:uploadSelection',
            manager.uploadSelection
        );
        atom.commands.add(
            'atom-workspace',
            'atom-sftp-sync:downloadSelection',
            manager.downloadSelection
        );
        atom.commands.add(
            'atom-workspace',
            'core:save',
            manager.uploadOnSave
        );
    },
};
