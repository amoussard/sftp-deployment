"use babel";

import Config from "./Config";

export default class SftpConfig extends Config {
  constructor() {
    super();

    this.port = 22;
    this.type = "sftp";
    this.sshKeyFile = null;
    this.passphrase = null;
  }
}

