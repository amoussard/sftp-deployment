"use babel";

export default class Queue {
  constructor(maxActive) {
    this.queue = [];
    this.actives = [];
    this.maxActive = maxActive;
    this.endCallback = () => {};
    this.errorCallback = () => {};

    for (var i = 0; i < this.maxActive; i++) {
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
    for (var i = 0; i < this.maxActive; i++) {
      if (this.actives[i] !== null) {
        return false;
      }
    }

    return (this.queue.length === 0);
  }

  nextSlotAvailable() {
    for (var i = 0; i < this.maxActive; i++) {
      if (this.actives[i] === null) {
        return i;
      }
    }

    return false;
  }

  next() {
    var self = this;
    var index = this.nextSlotAvailable();

    if (index !== false) {
      var action = this.queue.shift(action);

      if (action) {
        self.actives[index] = action;
        action.execute()
          .then(function(v) {
            self.actives[index] = null;
            self.next();
          })
          .catch(function(e) {
            self.errorCallback(e);
            self.next();
            self.actives[index] = null;
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

