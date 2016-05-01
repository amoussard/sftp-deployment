'use strict';
'use babel';

const path = require('path');

const Container = require('./container/Container');
const container = new Container();

// DEV MODE
// const ConsoleObserver = require('./observers/ConsoleObserver');

container.bootstrap(path.resolve(path.join(__dirname, './../services.json')));

const manager = container.get('deployment_manager');

// DEV MODE
// manager.registerObserver(new ConsoleObserver());

const test = {
    config: {
        uploadOnSave: {
            title: 'Upload on save',
            description: 'When enabled, remote files will be automatically uploaded when saved',
            type: 'boolean',
            default: true
        },
        messagePanel: {
            title: 'Display message panel',
            type: 'boolean',
            default: true
        },
        messagePanelTimeout: {
            title: 'Timeout for message panel',
            type: 'integer',
            default: 6000
        }
    },

    activate: () => {
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:mapToRemote',
            manager.generateConfigFile.bind(manager)
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:uploadCurrentFile',
            manager.uploadCurrentFile.bind(manager)
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:downloadCurrentFile',
            manager.downloadCurrentFile.bind(manager)
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:uploadOpenFiles',
            manager.uploadOpenFiles.bind(manager)
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:uploadSelection',
            manager.uploadSelection.bind(manager)
        );
        atom.commands.add(
            'atom-workspace',
            'sftp-deployment:downloadSelection',
            manager.downloadSelection.bind(manager)
        );
        atom.commands.add(
            'atom-workspace',
            'core:save',
            manager.uploadOnSave.bind(manager)
        );
    }
};

/**
 * Declare command palette to Atom
 * @type {Object}
 */
module.exports = test;
