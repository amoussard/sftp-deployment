"use babel";

import Exception from "./Exception";

export default class TransfertErrorException extends Exception {
  constructor(file, message) {
    super(`Transfert error with file "${file}": ${message}`);
  }
}

