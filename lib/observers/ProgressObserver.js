function ProgressObserver() {
}

var displayMessage = function(message, file, classes) {
  var atomModule = require('atom');
  var $ = atomModule.$;
  var md5 = require('MD5');

  var oMessage = $("#"+md5(file));

  if (oMessage.length === 0) {
    var workspace = $(".workspace");
    var messages = workspace.find(".sftp-progress-messages ul");
    if (messages.length === 0) {
      $('.workspace').append('<div class="sftp-progress-messages"><ul></ul></div>');
      messages = workspace.find(".sftp-progress-messages ul");
    }

    messages.append('<li id="'+md5(file)+'" class="'+classes+'">'+message+'</li>');
  } else {
    oMessage.attr("class", classes).html(message);
  }
};

var errorMessage = function(message, file) {
  displayMessage(message, file, 'error');
};

var warningMessage = function(message, file) {
  displayMessage(message, file, 'warning');
};

var pendingMessage = function(message, file) {
  displayMessage(message, file, 'pending');
};

var inProgressMessage = function(message, file) {
  displayMessage(message, file, 'in-progress');
};

var successMessage = function(message, file) {
  displayMessage(message, file, 'success');
};

ProgressObserver.prototype.notify = function(value, data) {
  switch (value) {
    case "file_upload_begin":
      pendingMessage("Upload of " + data + " : Pending", data);
      break;
    case "file_download_begin":
      pendingMessage("Download of " + data + " : Pending", data);
      break;
    case "file_upload_in_progress":
      inProgressMessage("Upload of " + data + " : In progress", data);
      break;
    case "file_download_in_progress":
      inProgressMessage("Download of " + data + " : In progress", data);
      break;
    case "file_upload_error":
      errorMessage("Upload of " + data + " : Error", data);
      break;
    case "file_download_error":
      errorMessage("Download of " + data + " : Error", data);
      break;
    case "file_upload_success":
      successMessage("Upload of " + data + " : Success", data);
      break;
    case "file_download_success":
      successMessage("Download of " + data + " : Success", data);
      break;


    default:
      break;
  }
};

module.exports = ProgressObserver;
