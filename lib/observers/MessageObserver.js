function MessageObserver() {
}

var createMessage = function(message, file, classes) {
  var atomModule = require('atom');
  var $ = atomModule.$;
  var md5 = require('MD5');

  var workspace = $(".workspace");
  var sftpMessages = workspace.find(".sftp-messages ul");
  if (sftpMessages.length === 0) {
    $('.workspace').append('<div class="sftp-messages"><ul></ul></div>');
    sftpMessages = workspace.find(".sftp-messages ul");
  }

  sftpMessages.append('<li id="'+md5(file)+'" class="message '+classes+'">'+message+'</li>');

  setTimeout(function() {
    var message = $("#"+md5(file));
    var messages = $(".sftp-messages ul").children('.message');
    message.remove();
    if (sftpMessages.find('.message').length === 0) {
      sftpMessages.parent().remove();
    }
  }, 3000);
};

var createErrorMessage = function(message, file) {
  createMessage(message, file, 'error');
};

var createWarningMessage = function(message, file) {
  createMessage(message, file, 'warning');
};

var createSuccessMessage = function(message, file) {
  createMessage(message, file, 'success');
};

MessageObserver.prototype.notify = function(value, data) {
    switch (value) {
        case "project_not_found":
            createErrorMessage("Create a project before trying to create a configuration file", 'project_not_found');
            break;
        case "configuration_file_creation_success":
            createSuccessMessage("The configuration file was created with success");
            break;
        case "configuration_file_creation_error":
            createErrorMessage("A error occured during configuration file creation");
            break;
        case "no_configuration_file_found":
              createErrorMessage("The configuration file doesn't exist");
              break;
        case "connection_error":
              createErrorMessage("The connection has encountered an error.", value);
              break;
        case "upload_file_error":
        case "sftp_upload_file_error":
        case "ftp_upload_file_error":
              createErrorMessage("Upload of " + data + " fail", data);
              break;
        case "upload_file_success":
        case "sftp_upload_file_success":
        case "ftp_upload_file_success":
              createSuccessMessage("Upload success");
              break;
        case "download_file_error":
        case "sftp_download_file_error":
        case "ftp_download_file_error":
              createErrorMessage("Download of " + data + " fail", data);
              break;
        case "download_file_success":
        case "sftp_download_file_success":
        case "ftp_download_file_success":
              createSuccessMessage("Download success");
              break;
        default:
            break;
    }
};

module.exports = MessageObserver;
