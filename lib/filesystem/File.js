"use babel";

import * as path from "path";
import Node from "./Node";

export default class File extends Node {
  constructor(path, relative) {
    super(path, relative);
  }

  getFilename() {
    return path.basename(this.path);
  }

  getDirectory() {
    return path.dirname(this.path);
  }
}

