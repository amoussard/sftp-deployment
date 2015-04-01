//////////////////
// Ctor
//////////////////

function Exception(message) {
    this.code = null;
    this.message = message;
}

Exception.prototype = Object.create(Error.prototype);

//////////////////
// Methods
//////////////////

/**
 * Path getter
 * @return {String}
 */
Exception.prototype.getMessage = function () {
    return this.message;
};

/**
 * Relative path getter
 * @return {String}
 */
Exception.prototype.getCode = function () {
    return this.code;
};

module.exports = Exception;
