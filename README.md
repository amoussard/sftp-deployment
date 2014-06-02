[![Build Status](https://travis-ci.org/amoussard/sftp-deployment.svg?branch=evol%2F3-upload-selection)](https://travis-ci.org/amoussard/sftp-deployment)
[![Coverage Status](https://img.shields.io/coveralls/amoussard/sftp-deployment.svg)](https://coveralls.io/r/amoussard/sftp-deployment)

#SFTP-Deployment for Atom.io

Spend less time managing file transfers and more time coding. FTP and SFTP support for Atom.io to send and receive files directly in your server.

SFTP-Deployment is a package for Atom.io using [SSH2 client](https://github.com/mscdex/ssh2) and [Node FTP](https://github.com/mscdex/node-ftp) modules written in pure Javascript for [node.js](http://nodejs.org/).

![SFTP-deployment](https://atom.io/assets/packages-d6c259ff67b995961012620be1e26678.gif "SFTP-deployment")

##Features

###Workflows
* Working off of a server
  * Create, edit, rename and delete files
  * Create, rename and delete folders
* Upload/Download files
* Upload/Download folders

###Compatibility
* Supports FTP and SFTP servers
* Password SSH support
* Works on Windows, OS X and Linux

###Integration
* Menu entries and command palette control
* File-based configuration (JSON)
* Colorized output panel with options for automatic hiding

## Installation

1. Search `sftp` or `ftp` in the atom package manager
2. Since the installation is successful, you can generate the configuration file with the command
  * `cmd-shift-p` and search `mapToRemote`
  * Packages menu -> FTP/SFTP -> Map to Remote...
  * Create your own
3. Set your ftp/sftp configuration in this file
4. Use it!

####Example of configuration file:

For SFTP protocol :
```
{
  "type": "sftp",
  "host": "example.com",
  "user": "username",
  "password": "password",
  "port": "22",
  "remote_path": "/example/path",
}
```

For FTP protocol :
```
{
  "type": "ftp",
  "host": "example.com",
  "user": "username",
  "password": "password",
  "port": "21",
  "remote_path": "/example/path"
}
```

##Next Versions

###Workflows
* Upload just the changes since your last commit
* See upload/download progress

###Compatibility
* Supports FTPS servers
* Supports both implicit (port 990) and explicit SSL for FTPS connections
* SSH key auth with SSH agent support
* Detects and informs about SSH host key changes
* Can detect changes via Git, Mercurial and SVN

###Integration
* Keyboard shortcuts
* Secure password and passphrase entry

##Version
* `0.4.0`
  * Upload/Download of folders
  * Refactoring of code
* `0.3.0`
  * Refactoring of the code
  * Notifications/message system
  * FTP support
  * ST3 package syntax support
  * bugfix
* `0.1.0` Build the first atom package
