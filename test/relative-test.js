/* jshint mocha: true */

'use strict';

var path = require('path');
var relative = require('../relative');

describe('relative', function() {

  describe('with value', function() {
    it('should be the relative path', function() {
      relative(__dirname).should.equal('test');
      relative('abc').should.equal('abc');
      relative('abc/def').should.equal('abc/def');
      path.resolve(process.cwd(), relative('/abc/def')).should.equal('/abc/def');
    });
  });

  describe('with bad values', function() {
    it('should be empty string', function() {
      relative().should.equal('');
      relative({}).should.equal('');
      relative(function(){}).should.equal('');
      relative(null).should.equal('');
      relative(false).should.equal('');
    });
  });

});
