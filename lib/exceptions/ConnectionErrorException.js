const util = require("util");

const Exception = require("./Exception");

// ////////////////
// Ctor
// ////////////////

function ConnectionErrorException(message) {
  Exception.apply(
    this,
    ["Cannot established connection : " + message]
  );
}

util.inherits(ConnectionErrorException, Exception);

module.exports = ConnectionErrorException;
