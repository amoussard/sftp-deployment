"use babel";

export default class Exception extends Error {
  constructor(message) {
    super(message);

    this.code = null;
    this.message = message;
  }

  getMessage() {
    return this.message;
  }

  getCode() {
    return this.code;
  }
}

