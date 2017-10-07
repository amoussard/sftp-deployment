"use babel";

import Exception from "./Exception";

export default class ConnectionErrorException extends Exception {
  constructor(message) {
    super("Cannot establish connection: " + message);
  }
}

