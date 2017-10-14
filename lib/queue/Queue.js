"use babel";

export default class Queue {
  constructor() {
    this.actions = [];
  }

  init(endCallback, errorCallback) {
    this.endCallback = endCallback;
    this.errorCallback = errorCallback;
  }

  addAction(action) {
    this.actions.push(action);
  }

  execute(endCallback, errorCallback) {
    this.init(endCallback, errorCallback);

    while (this.actions.length > 0) {
      const action = this.actions.shift();

      action().catch((e) => this.errorCallback(e));
    }

    this.endCallback();
  }
}

