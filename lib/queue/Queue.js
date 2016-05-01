'use strict';
'use babel';

class Queue
{
    constructor(maxActive) {
        this.queue = [];
        this.actives = [];
        this.maxActive = maxActive;
        this.endCallback = () => {
            // To be override
        };
        this.errorCallback = () => {
            // To be override
        };

        for (let i = 0; i < this.maxActive; i++) {
            this.actives[i] = null;
        }
    }

    addAction(action) {
        this.queue.push(action);
    }

    execute(endCallback, errorCallback) {
        this._init(endCallback, errorCallback);

        while (this._nextSlotAvailable() !== false && this.queue.length > 0) {
            this._next();
        }
    }

    _isFinished() {
        for (let i = 0; i < this.maxActive; i++) {
            if (this.actives[i] !== null) {
                return false;
            }
        }

        return this.queue.length === 0;
    }

    _nextSlotAvailable() {
        for (let i = 0; i < this.maxActive; i++) {
            if (this.actives[i] === null) {
                return i;
            }
        }

        return false;
    }

    _next() {
        const index = this._nextSlotAvailable();

        if (index !== false) {
            const action = this.queue.shift();

            if (action) {
                this.actives[index] = action;
                action.execute()
                    .then(() => {
                        this.actives[index] = null;
                        this._next();
                    })
                    .catch(e => {
                        this.errorCallback(e);
                        this._next();
                        this.actives[index] = null;
                    });

                return;
            }
        }

        if (this._isFinished()) {
            this._end();
        }
    }

    _init(endCallback, errorCallback) {
        this.endCallback = endCallback;
        this.errorCallback = errorCallback;
    }

    _end() {
        this.endCallback();
    }

}

module.exports = Queue;
