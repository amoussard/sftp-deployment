//////////////////
// Requires
//////////////////

var path = require('path');
var util = require('util');

var Node = require('./Node');

//////////////////
// Ctor
//////////////////

function Directory(_path, relative) {
    Node.apply(this, [_path, relative]);
}
util.inherits(Directory, Node);

module.exports = Directory;
