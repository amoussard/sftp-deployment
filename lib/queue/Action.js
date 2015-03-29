function Action(object, call, args) {
    this.object = object;
    this.call = call;
    this.args = args;
}

Action.prototype.execute = function() {
    return this.call.apply(this.object, this.args);
};

module.exports = Action;
