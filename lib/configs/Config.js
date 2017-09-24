"use babel";

import Promise from "bluebird";
import * as fs from "fs";
import * as path from "path";

export default class Config {
  constructor() {
    this.type = undefined;
    this.host = "";
    this.username = "";
    this.password = "";
    this.port = -1;
    this.remotePath = "";
    this.uploadOnSave = false;
    this.uploadConfigFile = false;
  }

  save(path) {
    return Promise.promisify(fs.writeFile)(path, JSON.stringify(this, replacer, 4));
  }
}

function replacer(key, value) {
  return value !== null ? value : undefined;
}

