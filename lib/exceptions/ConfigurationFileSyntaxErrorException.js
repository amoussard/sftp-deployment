const util = require("util");

const Exception = require("./Exception");

// ////////////////
// Ctor
// ////////////////

function ConfigurationFileSyntaxErrorException(message) {
  Exception.apply(
    this,
    ["The configuration file is not well formatted : " + message]
  );
}

util.inherits(ConfigurationFileSyntaxErrorException, Exception);

module.exports = ConfigurationFileSyntaxErrorException;
