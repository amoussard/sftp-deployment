//////////////////
// Ctor
//////////////////

function Connection(config) {
  this.config = config ? config : null;
  this.connection = null;
  this.nbFiles = 0;
}

//////////////////
// Methods
//////////////////

/**
 * @param  {Config} config
 */
Connection.prototype.init = function() {
};

/**
 * @param  {File[]} aFiles
 */
Connection.prototype.uploadFiles = function (aFiles) {
};

/**
 * @param  {File[]} aFiles
 */
Connection.prototype.downloadFiles = function (aFiles) {
};

module.exports = Connection;
