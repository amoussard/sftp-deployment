"use babel";

import Exception from "./Exception";

export default class RemoteDirectoryNotReadableException extends Exception {
  constructor(directory) {
    super(`The remote directory "${directory}" is not readable.`);
  }
}

