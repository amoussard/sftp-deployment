const util = require("util");

const Exception = require("./Exception");

// ////////////////
// Ctor
// ////////////////

function DirectoryCreationErrorException(directory) {
  Exception.apply(
    this,
    ["Cannot create directory \"" + directory + "\""]
  );
}

util.inherits(DirectoryCreationErrorException, Exception);

module.exports = DirectoryCreationErrorException;
