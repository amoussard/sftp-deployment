"use babel";

import Exception from "./Exception";

export default class DownloadErrorException extends Exception {
  constructor(file, message) {
    super(`Cannot download file "${file}": ${message}`);
  }
}

