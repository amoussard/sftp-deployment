"use babel";

export default class Action {
  constructor(object, call, args) {
    this.object = object;
    this.call = call;
    this.args = args;
  }

  execute() {
    return this.call.apply(this.object, this.args);
  }
}

