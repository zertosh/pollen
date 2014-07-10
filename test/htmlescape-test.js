/* jshint mocha: true */

'use strict';

var htmlescape = require('../htmlescape');

describe('htmlescape', function() {

  var evilObj;

  describe('with angle brackets "<" ">"', function() {
    before(function() {
      evilObj = { evil: '<script></script>' };
    });

    it('should escape', function() {
      htmlescape(evilObj)
        .should
        .equal('{"evil":"\\u003cscript\\u003e\\u003c/script\\u003e"}');
    });

    it('should parse back', function() {
      JSON.parse(htmlescape(evilObj))
        .should
        .eql(evilObj);
    });
  });

  describe('with ampersands "&"', function() {
    before(function() {
      evilObj = { evil: '&' };
    });

    it('should escape', function() {
      htmlescape(evilObj)
        .should
        .equal('{"evil":"\\u0026"}');
    });

    it('should parse back', function() {
      JSON.parse(htmlescape(evilObj))
        .should
        .eql(evilObj);
    });
  });

  describe('with "LINE SEPARATOR" and "PARAGRAPH SEPARATOR"', function() {
    before(function() {
      evilObj = { evil: '\u2028\u2029' };
    });

    it('should escape', function() {
      htmlescape(evilObj)
        .should
        .equal('{"evil":"\\u2028\\u2029"}');
    });

    it('should parse back', function() {
      JSON.parse(htmlescape(evilObj))
        .should
        .eql(evilObj);
    });

    it('should be valid in strings', function() {
      // jshint evil: true
      (function() { eval('(' + htmlescape(evilObj) + ')'); }
        .should
        .not
        .throw(SyntaxError));
    });

    it('should be invalid in strings', function() {
      // jshint evil: true
      (function() { eval('(' + JSON.parse(evilObj) + ')'); }
        .should
        .throw(SyntaxError));
    });
  });

});
