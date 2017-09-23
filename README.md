# Atom SFTP Sync

This is a fork of [Axel Moussard's sftp-deployment](https://github.com/amoussard/sftp-deployment).

Spend less time managing file transfers and more time coding.
FTP and SFTP support for Atom.io to send and receive files directly in your server.


## Features

### Workflows
* Upload/Download current file
* Upload open files (tabs)
* Upload/Download selection from Tree View

### Compatibility
* Supports FTP and SFTP servers
* Password SSH support
* Works on Windows, OS X and Linux

### Integration
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

The configuration file **MUST** always be in the root directory of your project.


## Examples of configuration files

### SFTP with user/password

```
{
    "type": "sftp",
    "host": "example.com",
    "user": "username",
    "password": "password",
    "port": "22",
    "remotePath": "/example/path"
}
```


### SFTP protocol with private key

```
{
    "type": "sftp",
    "host": "example.com",
    "user": "username",
    "port": "22",
    "remotePath": "/example/path",
    "sshKeyFile": "~/.ssh/id_rsa",
    "passphrase": "your_passphrase"
}
```

The passphrase is optional, only if your key require it.


### FTP protocol

```
{
  "type": "ftp",
  "host": "example.com",
  "username": "username",
  "password": "password",
  "port": "21",
  "remotePath": "/example/path"
}
```


## Next Versions

### Workflows
* Upload just the changes since your last commit
* See upload/download progress
* Synchronize in both directions


## Changelog

* `1.0.3`
  * Fixes syncing of files in new and nested directories.
* `1.0.1`
  * Fix after Atom update
* `1.0.0`
  * Full refactoring of the package
  * Improve stability
  * Best error management
  * Upload on save
  * Upload/Download selection of files and directories in tree-view
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

