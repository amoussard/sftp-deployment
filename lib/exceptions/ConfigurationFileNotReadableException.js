"use babel";

import Exception from "./Exception";

export default class ConfigurationFileNotReadableException extends Exception {
  constructor() {
    super("The configuration file is not readable.");
  }
}

