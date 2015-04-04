function Queue(maxActive) {
    this.queue = [];
    this.actives = [];
    this.maxActive = maxActive;
    this.endCallback = function() {};
    this.errorCallback = function() {};

    for (var i = 0; i < this.maxActive; i++) {
        this.actives[i] = null;
    }
}

Queue.prototype.init = function(endCallback, errorCallback) {
    this.endCallback = endCallback;
    this.errorCallback = errorCallback;
};

Queue.prototype.end = function() {
    this.endCallback();
};

Queue.prototype.addAction = function(action) {
    this.queue.push(action);
};

Queue.prototype.isFinished = function() {
    for (var i = 0; i < this.maxActive; i++) {
        if (this.actives[i] !== null) {
            return false;
        }
    }

    return (this.queue.length === 0);
}

Queue.prototype.nextSlotAvailable = function() {
    for (var i = 0; i < this.maxActive; i++) {
        if (this.actives[i] === null) {
            return i;
        }
    }

    return false;
}

Queue.prototype.next = function() {
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
};

Queue.prototype.execute = function(endCallback, errorCallback) {
    this.init(endCallback, errorCallback);

    while (this.nextSlotAvailable() !== false && this.queue.length > 0) {
        this.next();
    }
};

module.exports = Queue;
