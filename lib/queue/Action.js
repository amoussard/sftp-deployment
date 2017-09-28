"use babel";

export default class Action {
  constructor(object, call, args) {
    this.object = object;
    this.call = call;
    this.args = args;
  }

  execute() {
    return Reflect.apply(this.call, this.object, this.args);
  }
}

