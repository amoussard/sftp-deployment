"use babel";

import Exception from "./Exception";

export default class ConfigurationFileSyntaxErrorException extends Exception {
  constructor(message) {
    super("The configuration file is not well formatted: " + message);
  }
}

