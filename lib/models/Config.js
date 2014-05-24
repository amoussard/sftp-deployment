function Config() {
  this.host = undefined;
  this.username = undefined;
  this.password = undefined;
  this.port = undefined;
  this.dest = "test";
  this.type = undefined;
}

Config.prototype.getType = function () {
    return this.type;
};

Config.prototype.getConnectionInformations = function () {
  throw "You can't instantiate this class";
};

module.exports = Config;
