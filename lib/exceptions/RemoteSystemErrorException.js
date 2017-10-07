"use babel";

import Exception from "./Exception";

export default class RemoteSystemErrorException extends Exception {
  constructor(message) {
    super(`Remote System Error: "${message}"`);
  }
}

