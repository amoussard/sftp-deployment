"use babel";

export default class Queue {
  constructor(maxActive) {
    this.queue = [];
    this.actives = [];
    this.maxActive = maxActive;
    this.endCallback = null;
    this.errorCallback = null;

    for (let i = 0; i < this.maxActive; i++) {
      this.actives[i] = null;
    }
  }

  init(endCallback, errorCallback) {
    this.endCallback = endCallback;
    this.errorCallback = errorCallback;
  }

  end() {
    this.endCallback();
  }

  addAction(action) {
    this.queue.push(action);
  }

  isFinished() {
    for (let i = 0; i < this.maxActive; i++) {
      if (this.actives[i] !== null) {
        return false;
      }
    }

    return this.queue.length === 0;
  }

  nextSlotAvailable() {
    for (let i = 0; i < this.maxActive; i++) {
      if (this.actives[i] === null) {
        return i;
      }
    }

    return false;
  }

  next() {
    const index = this.nextSlotAvailable();

    if (index !== false) {
      const action = this.queue.shift(action);

      if (action) {
        this.actives[index] = action;
        action.execute().
          then(() => {
            this.actives[index] = null;
            this.next();
          }).
          catch((e) => {
            this.errorCallback(e);
            this.next();
            this.actives[index] = null;
          });

        return;
      }
    }

    if (this.isFinished()) {
      this.end();
    }
  }

  execute(endCallback, errorCallback) {
    this.init(endCallback, errorCallback);

    while (this.nextSlotAvailable() !== false && this.queue.length > 0) {
      this.next();
    }
  }
}

