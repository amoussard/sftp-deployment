function MessageObserver() {
}

var createMessage = function(message, classes) {
    var atomModule = require('atom-space-pen-views');
    var $ = atomModule.$;

    var workspace = $('.workspace');
    var sftpMessages = workspace.find('.sftp-messages ul');
    if (sftpMessages.length === 0) {
        $('.workspace').append('<div class=\'sftp-messages\'><ul></ul></div>');
        sftpMessages = workspace.find('.sftp-messages ul');
    }

    var id = 'sftp-message-' + sftpMessages.length;
    sftpMessages.append('<li id="' + id + '" class=\'message ' + classes + '\'>' + message + '</li>');

    setTimeout(function() {
        var message = $('#' + id);
        var messages = $('.sftp-messages ul').children('.message');
        message.remove();
        if (sftpMessages.find('.message').length === 0) {
            sftpMessages.parent().remove();
        }
    }, 3000);
};

var createErrorMessage = function(message) {
    hideLoader();
    createMessage(message, 'error');
};

var createWarningMessage = function(message) {
    hideLoader();
    createMessage(message, 'warning');
};

var createSuccessMessage = function(message) {
    hideLoader();
    createMessage(message, 'success');
};

var showLoader = function() {
    var atomModule = require('atom-space-pen-views');
    var $ = atomModule.$;

    var workspace = $('.workspace');
    var sftpLoader = workspace.find('.sftp-loader');
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

var hideLoader = function() {
    var atomModule = require('atom-space-pen-views');
    var $ = atomModule.$;

    var sftpLoader = $('.workspace').find('.sftp-loader');
    if (sftpLoader.length !== 0) {
        sftpLoader.hide();
    }
}

MessageObserver.prototype.notify = function(value, data) {
    switch (value) {
        case 'begin_transfert':
            showLoader();
            break;
        case 'project_not_found':
            createErrorMessage('Create a project before trying to create a configuration file', 'project_not_found');
            break;
        case 'configuration_file_creation_success':
            createSuccessMessage('The configuration file was created with success');
            break;
        case 'configuration_file_creation_error':
            createErrorMessage('A error occured during configuration file creation');
            break;
        case 'no_configuration_file_found':
            createErrorMessage('The configuration file doesn\'t exist');
            break;
        case 'configuration_file_not_readable':
            createErrorMessage('The configuration file is not readable');
            break;
        case 'configuration_file_not_readable':
            createErrorMessage('The configuration file is not readable');
            break;
        case 'configuration_file_syntax_error':
            createErrorMessage(data.message);
            break;
        case 'connection_error':
            createErrorMessage(data.message);
            break;
        case 'remote_directory_creation_error':
            createErrorMessage(data.message);
            break;
        case 'remote_directory_not_readable':
            createErrorMessage(data.message);
            break;
        case 'directory_creation_error':
            createErrorMessage(data.message);
            break;
        case 'remote_system_error':
            createErrorMessage(data.message);
            break;
        case 'upload_file_error':
            createErrorMessage(data.message);
            break;
        case 'transfert_file_error':
            createErrorMessage(data.message);
            break;
        case 'upload_file_success':
            createSuccessMessage('Upload success');
            break;
        case 'download_file_error':
            createErrorMessage(data.message);
            break;
        case 'download_file_success':
            createSuccessMessage('Download success');
            break;
        default:
            break;
    }
};

module.exports = MessageObserver;
