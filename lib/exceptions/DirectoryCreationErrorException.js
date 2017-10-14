"use babel";

import Exception from "./Exception";

export default class DirectoryCreationErrorException extends Exception {
  constructor(directory) {
    super(`Cannot create directory "${directory}"`);
  }
}

