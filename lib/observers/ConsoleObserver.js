function MessageObserver() {
}

MessageObserver.prototype.notify = function(value, data) {
  switch (value) {
    case "project_not_found":
      console.log("Create a project before trying to create a configuration file");
      break;
    case "configuration_file_doesnt_exist":
      console.log("The configuration file doesn't exist");
      break;
    case "configuration_file_exists":
      console.log("The configuration file exists");
      break;
    case "configuration_ready":
      console.log("The configuration is ready");
      console.log(data);
      break;
    case "connection_ready":
      console.log("The connection is ready");
      console.log(data);
      break;
    case "connection_error":
      console.log("The connection has encountered an error : " + data);
      break;
    case "connection_sftp_end":
    case "connection_ftp_end":
      console.log("The sftp connection ends");
      break;
    case "sftp_mkdir":
    case "ftp_mkdir":
      console.log("Creation of directory : " + data);
      break;
    case "sftp_mkdir_upload_file_error":
    case "ftp_mkdir_upload_file_error":
      console.log("Creation of directory " + data + " fail");
      break;
    case "sftp_upload_file":
    case "ftp_upload_file":
      console.log("Upload of " + data);
      break;
    case "sftp_upload_file_error":
    case "ftp_upload_file_error":
      console.log("Upload of " + data + " fail");
      break;
    case "sftp_upload_file_success":
    case "ftp_upload_file_success":
      console.log("Upload of " + data + " success");
      break;
    case "sftp_download_file":
    case "ftp_download_file":
      console.log("Download of " + data);
      break;
    case "sftp_download_file_error":
    case "ftp_download_file_error":
      console.log("Download of " + data + " fail");
      break;
    case "sftp_download_file_success":
    case "ftp_download_file_success":
      console.log("Download of " + data + " success");
      break;
    default:
      break;
  }
};

module.exports = MessageObserver;
