function Observer() {
}

Observer.prototype.notify = function() {
  throw "You can't use this class directly";
};

module.exports = Observer;
