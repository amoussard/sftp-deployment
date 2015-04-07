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
        atom.commands.add(
            'atom-workspace',
            'core:save',
            manager.uploadOnSave
        );
    },

//     handleEvent: function(textEditor) {
// console.log(textEditor);
//         textEditor.buffer.onDidSave(function() {
// console.log('test');
//             return manager.uploadOnSave();
//         });
//     }
};
