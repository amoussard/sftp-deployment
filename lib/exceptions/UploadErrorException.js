"use babel";

import Exception from "./Exception";

export default class UploadErrorException extends Exception {
  constructor(file, message) {
    super(`Cannot upload file "${file}": ${message}`);
  }
}

