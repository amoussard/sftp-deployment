"use babel";

import TextEditorView from "atom-space-pen-views";

const {$} = TextEditorView;

export default class MessageObserver {
  notify(value, data) {
    switch (value) {
    case "begin_transfert":
      showLoader();
      break;
    case "project_not_found":
      createErrorMessage("Create a project before trying to create a configuration file", "project_not_found");
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
    case "configuration_file_not_readable":
      createErrorMessage("The configuration file is not readable");
      break;
    case "configuration_file_syntax_error":
      createErrorMessage(data.message);
      break;
    case "connection_error":
      createErrorMessage(data.message);
      break;
    case "remote_directory_creation_error":
      createErrorMessage(data.message);
      break;
    case "remote_directory_not_readable":
      createErrorMessage(data.message);
      break;
    case "directory_creation_error":
      createErrorMessage(data.message);
      break;
    case "remote_system_error":
      createErrorMessage(data.message);
      break;
    case "upload_file_error":
      createErrorMessage(data.message);
      break;
    case "transfert_file_error":
      createErrorMessage(data.message);
      break;
    case "upload_file_success":
      createSuccessMessage("Upload success");
      break;
    case "download_file_error":
      createErrorMessage(data.message);
      break;
    case "download_file_success":
      createSuccessMessage("Download success");
      break;
    default:
      break;
    }
  }
}

function createMessage(message, classes) {

  const workspace = $(".workspace");
  let sftpMessages = workspace.find(".sftp-messages ul");

  if (sftpMessages.length === 0) {
    $(".workspace").append("<div class='sftp-messages'><ul></ul></div>");
    sftpMessages = workspace.find(".sftp-messages ul");
  }

  const id = "sftp-message-" + sftpMessages.length;

  sftpMessages.append("<li id=\"" + id + "\" class='message " + classes + "'>" + message + "</li>");

  setTimeout(() => {
    const element = $("#" + id);

    element.remove();
    if (sftpMessages.find(".message").length === 0) {
      sftpMessages.parent().remove();
    }
  }, 3000);
}

function createErrorMessage(message) {
  hideLoader();
  createMessage(message, "error");
}

function createSuccessMessage(message) {
  hideLoader();
  createMessage(message, "success");
}

function showLoader() {
  const workspace = $(".workspace");
  let sftpLoader = workspace.find(".sftp-loader");

  if (sftpLoader.length === 0) {
    workspace.append(
      "<div class=\"sftp-loader\"><div class=\"message\">" +
      "<span class=\"loading loading-spinner-tiny inline-block\"></span>" +
      "<span>Loading...</span>" +
      "</div></div>");
    sftpLoader = workspace.find(".sftp-loader");
  }
  sftpLoader.show();
}

function hideLoader() {
  const sftpLoader = $(".workspace").find(".sftp-loader");

  if (sftpLoader.length !== 0) {
    sftpLoader.hide();
  }
}

