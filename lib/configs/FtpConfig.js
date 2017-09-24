"use babel";

import Config from "./Config";

export default class FtpConfig extends Config {
  constructor() {
    super();

    this.port = 21;
    this.type = "ftp";
  }
}

