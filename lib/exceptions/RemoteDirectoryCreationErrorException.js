"use babel";

import Exception from "./Exception";

export default class RemoteDirectoryCreationErrorException extends Exception {
  constructor(directory) {
    super(`Cannot create remote directory "${directory}"`);
  }
}

