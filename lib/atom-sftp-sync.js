"use babel";

/* global atom */

import DeploymentManager from "./DeploymentManager";
import MessageObserver from "./observers/MessageObserver";

export default {
  "config": {
    "uploadOnSave": {
      "title": "Upload on save",
      "description": "When enabled, remote files will be automatically uploaded when saved",
      "type": "boolean",
      "default": true
    },
    "messagePanel": {
      "title": "Display message panel",
      "type": "boolean",
      "default": true
    },
    "sshPrivateKeyPath": {
      "title": "Path to private SSH key",
      "type": "string",
      "default": "~/.ssh/id_rsa"
    },
    "messagePanelTimeout": {
      "title": "Timeout for message panel",
      "type": "integer",
      "default": 6000
    }
  },

  activate() {
    const manager = new DeploymentManager();

    manager.registerObserver(new MessageObserver());

    atom.commands.add(
      "atom-workspace",
      "atom-sftp-sync:mapToRemote",
      manager.generateConfigFile.bind(manager)
    );
    atom.commands.add(
      "atom-workspace",
      "atom-sftp-sync:uploadCurrentFile",
      manager.uploadCurrentFile.bind(manager)
    );
    atom.commands.add(
      "atom-workspace",
      "atom-sftp-sync:downloadCurrentFile",
      manager.downloadCurrentFile.bind(manager)
    );
    atom.commands.add(
      "atom-workspace",
      "atom-sftp-sync:uploadOpenFiles",
      manager.uploadOpenFiles.bind(manager)
    );
    atom.commands.add(
      "atom-workspace",
      "atom-sftp-sync:uploadSelection",
      manager.uploadSelection.bind(manager)
    );
    atom.commands.add(
      "atom-workspace",
      "atom-sftp-sync:downloadSelection",
      manager.downloadSelection.bind(manager)
    );
    atom.commands.add(
      "atom-workspace",
      "core:save",
      manager.uploadOnSave.bind(manager)
    );
  }
}

