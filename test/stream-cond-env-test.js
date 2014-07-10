/* jshint mocha: true */

'use strict';

describe('stream-cond-env', function() {

  var ifEnv = require('../stream-cond-env').ifEnv;
  var unlessEnv = require('../stream-cond-env').unlessEnv;

  describe('exports', function() {
    it('should export "ifEnv"', function() {
      ifEnv.should.be.a.Function;
    });
    it('should export "unlessEnv"', function() {
      unlessEnv.should.be.a.Function;
    });
  });

  describe('as boolean with "ifEnv"', function() {
    it('should be true for current NODE_ENV', function() {
      ifEnv(process.env.NODE_ENV).should.be.true;
    });
    it('should be false for diff NODE_ENV', function() {
      ifEnv(String(Date.now())).should.be.false;
    });
  });

  describe('as boolean with "unlessEnv"', function() {
    it('should be false for current NODE_ENV', function() {
      unlessEnv(process.env.NODE_ENV).should.be.false;
    });
    it('should be true for diff NODE_ENV', function() {
      unlessEnv(Date.now()).should.be.true;
    });
  });


  describe('as stream/fn with "ifEnv"', function() {
    it('should call passed fn for current NODE_ENV', function() {
      ifEnv(process.env.NODE_ENV, someFn, 1, 1).should.be.eql([ 1, 1 ]);
    });
    it('should return noop stream for diff NODE_ENV', function() {
      isStream(ifEnv(Date.now(), someFn, 1, 1)).should.be.true;
    });
  });

  describe('as stream/fn with "unlessEnv"', function() {
    it('should return noop stream for current NODE_ENV', function() {
      isStream(unlessEnv(process.env.NODE_ENV, someFn, 1, 1)).should.be.true;
    });
    it('should call passed fn for diff NODE_ENV', function() {
      unlessEnv(Date.now(), someFn, 1, 1).should.be.eql([ 1, 1 ]);
    });
  });

});

function someFn(arg1, arg2) {
  return [ arg1, arg2 ];
}

function isStream(obj) {
  return obj && typeof obj.pipe === 'function';
}
