/* jshint mocha: true */

'use strict';

var through = require('through2');
var noop = require('../stream-noop');

describe('stream-noop', function() {
  describe('noop()', function() {
    it('should passthrough the stream', function(done) {

      var data = String(Date.now());
      var stream = through();

      stream.push(data);
      stream.pipe(noop())
        .pipe(through(function(chunk) {
          chunk.toString().should.equal(data);
          done();
        }));
    });
  });
});
