"use babel";

import Exception from "./Exception";

export default class NoConfigurationFileFoundException extends Exception {
  constructor() {
    super("No configuration file found.");
  }
}

