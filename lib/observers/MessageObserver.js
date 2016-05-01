'use strict';
'use babel';

const Observer = require('./Observer');
const atomModule = require('atom-space-pen-views');
const $ = atomModule.$;

const MESSAGE_DURATION = 3;

class MessageObserver extends Observer
{
    notify(value, data) {
        switch (value) {
            case 'begin_transfert':
                this._showLoader();
                break;
            case 'project_not_found':
                this._createErrorMessage(
                    'Create a project before trying to create a configuration file',
                    'project_not_found'
                );
                break;
            case 'configuration_file_creation_success':
                this._createSuccessMessage('The configuration file was created with success');
                break;
            case 'configuration_file_creation_error':
                this._createErrorMessage('A error occurred during configuration file creation');
                break;
            case 'no_configuration_file_found':
                this._createErrorMessage('The configuration file doesn\'t exist');
                break;
            case 'configuration_file_not_readable':
                this._createErrorMessage('The configuration file is not readable');
                break;
            case 'configuration_file_syntax_error':
                this._createErrorMessage(data.message);
                break;
            case 'connection_error':
                this._createErrorMessage(data.message);
                break;
            case 'remote_directory_creation_error':
                this._createErrorMessage(data.message);
                break;
            case 'remote_directory_not_readable':
                this._createErrorMessage(data.message);
                break;
            case 'directory_creation_error':
                this._createErrorMessage(data.message);
                break;
            case 'remote_system_error':
                this._createErrorMessage(data.message);
                break;
            case 'upload_file_error':
                this._createErrorMessage(data.message);
                break;
            case 'transfert_file_error':
                this._createErrorMessage(data.message);
                break;
            case 'upload_file_success':
                this._createSuccessMessage('Upload success');
                break;
            case 'download_file_error':
                this._createErrorMessage(data.message);
                break;
            case 'download_file_success':
                this._createSuccessMessage('Download success');
                break;
            default:
                break;
        }
    }

    _createMessage(message, classes) {
        const workspace = $('.workspace');
        let sftpMessages = workspace.find('.sftp-messages ul');

        if (sftpMessages.length === 0) {
            workspace.append('<div class=\'sftp-messages\'><ul></ul></div>');
            sftpMessages = workspace.find('.sftp-messages ul');
        }

        const id = `sftp-message-${sftpMessages.length}`;

        sftpMessages.append(`<li id="${id}" class="message ${classes}">${message}</li>`);

        setTimeout(() => {
            const message = $(`#${id}`);

            message.remove();

            if (sftpMessages.find('.message').length === 0) {
                sftpMessages.parent().remove();
            }
        }, MESSAGE_DURATION * 1000);
    }

    _createErrorMessage(message) {
        MessageObserver._hideLoader();
        this._createMessage(message, 'error');
    }

    _createWarningMessage(message) {
        MessageObserver._hideLoader();
        this._createMessage(message, 'warning');
    }

    _createSuccessMessage(message) {
        MessageObserver._hideLoader();
        this._createMessage(message, 'success');
    }

    static _showLoader() {
        const workspace = $('.workspace');
        let sftpLoader = workspace.find('.sftp-loader');

        if (sftpLoader.length === 0) {
            workspace.append(
                '<div class="sftp-loader"><div class="message">'
                + '<span class="loading loading-spinner-tiny inline-block"></span>'
                + '<span>Loading...</span>'
                + '</div></div>');
            sftpLoader = workspace.find('.sftp-loader');
        }
        sftpLoader.show();
    }

    static _hideLoader() {
        const sftpLoader = $('.workspace').find('.sftp-loader');

        if (sftpLoader.length !== 0) {
            sftpLoader.hide();
        }
    }
}

module.exports = MessageObserver;
