"use babel";

import * as path from "path";
import Node from "./Node";

export default class File extends Node {
  getFilename() {
    return path.basename(this.path);
  }

  getDirectory() {
    return path.dirname(this.path);
  }
}

