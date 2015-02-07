var SSH = require('node-ssh');

module.exports = {
  nbFinishedFile: 0,
  uploadCurrentFile: function() {
    var fs = require('fs');
    var path = require('path');
    var SFTP = require('./SFTP');

    var editor = atom.workspace.activePaneItem;
    var srcFile = editor.buffer.file.path;
    var fileName = path.basename(srcFile);

    fs.readFile(path.join(atom.project.path, "sftp-config.json"), 'utf8', function(err, data) {
      if (err)
        throw err;

      var config = JSON.parse(data);
      var connection = new SSH(config);
      connection.connect().then(function(){
        var relativePath = path.relative(atom.project.path, srcFile);
        var destFile = path.join(config.destDir, relativePath);
        connection.put(srcFile,destFile);
      });
    });
  },

  uploadOpenFiles: function() {
    var fs = require('fs');
    var path = require('path');
    var SFTP = require('./SFTP');

    var aPath = [];
    atom.workspace.getActivePane().getItems().forEach(function(item){
      aPath.push(item.buffer.file.path);
    });

    fs.readFile(path.join(atom.project.path, "sftp-config.json"), 'utf8', function(err, data) {
      if (err)
        throw err;
      var
        config = JSON.parse(data),
        connection = new SSH(config);
      connection.connect().then(function(){
        var FilesToUpload = [];
        aPath.forEach(function(File){
          FilesToUpload.push({
            Local: File,
            Remote: path.join(config.destDir, path.relative(atom.project.path, File))
          })
        });
        connection.putMulti(FilesToUpload);
      });
    });
  },

  createMessage: function(message, file, classes) {
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
  },

  downloadCurrentFile: function() {
    // console.log('download current file');
    var fs = require('fs');
    var path = require('path');
    var SFTP = require('./SFTP');

    var editor = atom.workspace.activePaneItem;
    var destFile = editor.buffer.file.path;
    var fileName = path.basename(destFile);
    var relativePath = path.relative(atom.project.path, destFile);

    atom.confirm({
      message: "You will download the current file, be careful, it will be overwritted.",
      detailedMessage: relativePath,
      buttons: {
        "Overwrite": function () {
          fs.readFile(path.join(atom.project.path, "sftp-config.json"), 'utf8', function(err, data) {
            if (err)
              throw err;

            var config = JSON.parse(data);
            var connection = new SSH(config);
            connection.connect().then(function(){
              var srcFile = path.join(config.destDir, relativePath);
              connection.get(srcFile,destFile);
            });
          });
        },
        "Cancel": null
      }
    });
  },

  mapToRemote: function() {
    // console.log('map to remote');
    var fs = require('fs');
    var path = require('path');
    var config = {
      host: "your_host",
      username: "your_user",
      password: "your_pass",
      port: "your_port",
      destDir: "destination_directory"
    };
    fs.writeFile(path.join(atom.project.path, "sftp-config.json"), JSON.stringify(config, undefined, 2));
  }

  // uploadSelection: function(entry) {
  //   console.log('upload selection');
  //   var atomModule = require('atom');
  //   var fs = require('fs');
  //   var path = require('path');
  //   var SFTP = require('./SFTP');
  //
  //   var $ = atomModule.$;
  //   var aPath = [];
  //
  //   $(".tree-view .selected").each(function () {
  //     aPath.push($(this).view().getPath());
  //   });
  //
  //   fs.readFile(path.join(atom.project.path, "sftp-config.json"), 'utf8', function(err, data) {
  //     if (err)
  //       throw err;
  //
  //     var config = JSON.parse(data);
  //     var aFiles = [];
  //     for (var i in aPath) {
  //       var srcFile = aPath[i];
  //       var relativePath = path.relative(atom.project.path, srcFile);
  //       var destFile = path.join(config.destDir, relativePath);
  //
  //       aFiles.push({src:srcFile, dest:destFile});
  //     }
  //
  //     var connection = SFTP.initConnection();
  //
  //     connection.on('ready', function () {
  //       SFTP.uploadFiles(connection, aFiles);
  //     });
  //
  //     connection.connect(config);
  //   });
  // }
};
