#SFTP-Deployment for Atom.io

Spend less time managing file transfers and more time coding. FTP, FTPS and SFTP support for Atom.io to send files directly in your server.

SFTP-Deployment is a package for Atom.io using [SSH2 client](https://github.com/mscdex/ssh2) module written in pure Javascript for [node.js](http://nodejs.org/).

##Features

###Workflows
* Working off of a server
  * Create, edit, rename and delete files
  * Create, rename and delete folders
* Upload files, folders, or just the changes since your last commit
* Download files or folders

###Compatibility
* Supports FTP, FTPS and SFTP servers
* Supports both implicit (port 990) and explicit SSL for FTPS connections
* Password and SSH key auth with SSH agent support
* Detects and informs about SSH host key changes
* Works on Windows, OS X and Linux
* Can detect changes via Git, Mercurial and SVN
* Unicode filename support

###Integration
* Keyboard shortcuts, menu entries and command palette control
* Secure password and passphrase entry
* File-based configuration (JSON)
* Colorized output panel with options for automatic hiding

##Version
* `0.0.1` Build the first atom package
