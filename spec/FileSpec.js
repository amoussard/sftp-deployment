var assert = require('assert');

var File = require('../lib/filesystem/File');

describe('File', function() {
  var file = new File('/home/amoussard/test/directory/file.txt');

  describe('#getPath()', function() {
    it('should return the complete path', function() {
      assert.equal('/home/amoussard/test/directory/file.txt', file.getPath());
    });
  });

  describe('#getFilename()', function(){
    it('should return the name of the file', function() {
      assert.equal('file.txt', file.getFilename());
    });
  });

  describe('#getDirectory()', function(){
    it('should return the name of the directory', function() {
      assert.equal('/home/amoussard/test/directory', file.getDirectory());
    });
  });

});
