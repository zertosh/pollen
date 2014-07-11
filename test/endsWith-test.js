/* jshint mocha: true */

'use strict';

var endsWith = require('../endsWith');

describe('endsWith', function() {

  describe('a string on a string', function() {
    it('should end with', function() {
      endsWith('abcdef', 'def').should.be.true;
      endsWith('abc def', 'def').should.be.true;
      endsWith(' abcdef', 'def').should.be.true;
      endsWith('abcdef', '').should.be.true;
    });

    it('should not end with', function() {
      endsWith('abcdef ', 'def').should.be.false;
      endsWith('abcde f', 'def').should.be.false;
      endsWith('abcef', 'def').should.be.false;
      endsWith('', 'def').should.be.false;
    });
  });

  describe('a string on bad values', function() {
    it('should not end with', function() {
      endsWith('abcdef').should.be.false;
      endsWith('abcdef', {}).should.be.false;
      endsWith('abcdef', function(){}).should.be.false;
      endsWith('abcdef', /def$/).should.be.false;
      endsWith('abcdef', true).should.be.false;
      endsWith('abcdef', false).should.be.false;
    });
  });

  describe('a bad values on a string', function() {
    it('should not end with', function() {
      endsWith(undefined, 'abcdef').should.be.false;
      endsWith({}, 'abcdef').should.be.false;
      endsWith(function(){}, 'abcdef').should.be.false;
      endsWith(/def$/, 'abcdef').should.be.false;
      endsWith(true, 'abcdef').should.be.false;
      endsWith(false, 'abcdef').should.be.false;
    });
  });

  describe('a bad values on bad values', function() {
    it('should not end with', function() {
      endsWith().should.be.false;
      endsWith(undefined, undefined).should.be.false;
      endsWith({}, null).should.be.false;
      endsWith(function(){}, {}).should.be.false;
      endsWith(/def$/).should.be.false;
      endsWith(true, true).should.be.false;
      endsWith(false, false).should.be.false;
    });
  });

});
