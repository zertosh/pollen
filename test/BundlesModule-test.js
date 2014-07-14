/* jshint mocha: true */

'use strict';

var fs = require('fs');
var should = require('should');

describe('BundlesModule', function() {

  var BundlesModule = require('../BundlesModule');

  var builtFiles = ['test/fixtures/depB-built.js', 'test/fixtures/depA-built.js'];
  var depAB;

  describe('fixtures', function() {
    it('should have modules', function() {
      fs.existsSync('./test/fixtures/depA.js').should.be.true;
      fs.existsSync('./test/fixtures/depA1.js').should.be.true;
      fs.existsSync('./test/fixtures/depB.js').should.be.true;
      fs.existsSync('./test/fixtures/depB1.js').should.be.true;
    });
    it('should have built modules', function() {
      fs.existsSync('./test/fixtures/depA-built.js').should.be.true;
      fs.existsSync('./test/fixtures/depB-built.js').should.be.true;
    });
  });

  describe('Constructor', function() {
    it('should throw when missing options', function() {
      (function() { BundlesModule(); }
        .should.throw('BundlesModule requires "opts"'));
    });
    it('should throw when files isn\'t an array', function() {
      (function() { BundlesModule({ files: '' }); }
        .should.throw('BundlesModule "opts.files" must be an array'));
    });
    it('should throw when files doesn\'t contain strings', function() {
      (function() { BundlesModule({ files: [] }); }
        .should.throw('BundlesModule "opts.files" must have strings'));
    });
    it('should return instances with "new"', function() {
      (new BundlesModule({ files: builtFiles }))
        .should.be.instanceof(BundlesModule);
    });
    it('should return instances without "new"', function() {
      BundlesModule({ files: builtFiles })
        .should.be.instanceof(BundlesModule);
    });
  });

  describe('"options" get set', function() {
    var origNodeEnv = process.env.NODE_ENV;
    var files = ['a', 'b', 'c'];

    beforeEach(function() {
      process.env.NODE_ENV = origNodeEnv;
    });

    after(function() {
      process.env.NODE_ENV = origNodeEnv;
    });

    it('should have copy of files array', function() {
      BundlesModule({ files: files })._files
        .should.be.eql(files).and.not.equal(files);
    });

    it('should by default not "hotreplace" in production', function() {
      process.env.NODE_ENV = 'production';
      BundlesModule({ files: files })._hotreplace.should.be.false;
    });

    it('should by default "hotreplace" in non-production', function() {
      process.env.NODE_ENV = 'whatever';
      BundlesModule({ files: files })._hotreplace.should.be.true;
    });

    it('should honor "hotreplace" option in production', function() {
      process.env.NODE_ENV = 'production';
      BundlesModule({ files: files, hotreplace: true })._hotreplace.should.be.true;
      BundlesModule({ files: files, hotreplace: false })._hotreplace.should.be.false;
    });

    it('should honor "hotreplace" option in non-production', function() {
      process.env.NODE_ENV = 'whatever';
      BundlesModule({ files: files, hotreplace: true })._hotreplace.should.be.true;
      BundlesModule({ files: files, hotreplace: false })._hotreplace.should.be.false;
    });

    it('should have correct "nocache" option', function() {
      BundlesModule({ files: files })._nocache.should.be.false;
      BundlesModule({ files: files, nocache: true })._nocache.should.be.true;
      BundlesModule({ files: files, nocache: false })._nocache.should.be.false;
    });

    it('should have correct "name" option', function() {
      BundlesModule({ files: files })._name.should.equal('bundle.js');
      BundlesModule({ files: files, name: 'a.js' })._name.should.equal('a.js');
    });
  });

  describe('#read', function() {
    var combineSourceMap = require('combine-source-map');
    before(function() {
      depAB = BundlesModule({ files: builtFiles }).read();
    });
    it('should have packs', function() {
      depAB.should.have.property('_packs').with.lengthOf(2);
    });
    it('should have code', function() {
      depAB.should.have.property('_code').and.be.type('string');
    });
    it('should have a module in the stitched code', function() {
      depAB._code.should.containEql( combineSourceMap.removeComments(depAB._packs[0].source) );
    });
    it('should have the other module in the stitched code', function() {
      depAB._code.should.containEql( combineSourceMap.removeComments(depAB._packs[1].source) );
    });
  });

  describe('#require', function() {
    before(function() {
      depAB = BundlesModule({ files: builtFiles, hotreplace: false });
    });
    it('should return a function', function() {
      depAB.exports().should.be.a.Function;
    });
    it('should be requireable', function() {
      depAB.exports()('depA').should.be.an.Object;
    });
    it('should have depA contents', function() {
      depAB.exports()('depA').depA1.should.equal('depA1');
    });
    it('should have depB', function() {
      depAB.exports()('depA').depB.should.be.an.Object;
    });
    it('should have depB contents', function() {
      depAB.exports()('depA').depB.depB1.should.equal('depB1');
    });
    it('should produce the same exports', function() {
      depAB.exports()('depA').should.equal( depAB.exports()('depA') );
    });
  });

  describe('#require with "hotreplace" off', function() {
    var depAB;
    beforeEach(function() {
      depAB = BundlesModule({ files: builtFiles, hotreplace: false });
    });
    it('exported should not change when no file changed', function() {
      depAB.exports()('depA').newValue = 123;
      depAB.exports()('depA').newValue.should.equal(123);
    });
    it('exported should not change even if a dep changed', function() {
      depAB.exports()('depA').newValue = 123;
      depAB._packs[0].mtime = 0;
      depAB.exports()('depA').newValue.should.equal(123);
    });
    it('exported should not change even if another dep changed', function() {
      depAB.exports()('depA').newValue = 123;
      depAB._packs[1].mtime = 0;
      depAB.exports()('depA').newValue.should.equal(123);
    });

  });

  describe('#require with "hotreplace" on', function() {
    var newTime;
    beforeEach(function() {
      depAB = BundlesModule({ files: builtFiles, hotreplace: true });
      newTime = (Date.now() / 1000) + Math.floor( Math.random() * 100 );
    });
    it('exported should not change when mtime hasn\'t changed', function() {
      depAB.exports()('depA').newValue = 123;
      depAB.exports()('depA').newValue.should.equal(123);
    });
    it('exported should change when one module changed', function() {
      depAB.exports()('depA').newValue = 123;
      fs.utimesSync(depAB._packs[0].id, newTime, newTime);
      should( depAB.exports()('depA').newValue ).not.be.ok;
    });
    it('exported should change when another module changed', function() {
      depAB.exports()('depA').newValue = 123;
      fs.utimesSync(depAB._packs[1].id, newTime, newTime);
      depAB.exports()('depA').should.not.have.property('newValue');
    });
  });

  describe('#require with "nocache" on', function() {
    it('exported should change after every require', function() {
      depAB = BundlesModule({ files: builtFiles, nocache: true });
      depAB.exports()('depA').should.not.equal( depAB.exports()('depA') );
    });
  });

  describe('#uncache', function() {
    it('exported should get new exported', function() {
      depAB = BundlesModule({ files: builtFiles });
      depAB.exports()('depA').should.not.equal( depAB.uncache().exports()('depA') );
    });
  });

  describe('#derequire', function() {
    it('should reset internal caches', function() {
      depAB = BundlesModule({ files: builtFiles });
      depAB.exports();
      depAB.reset();
      depAB.should.have.properties({ _packs: null, _code: null, _exports: null });
    });
  });

});


/*
(function makeFixtures() {
  var files = [
    {
      filename: './test/fixtures/depA.js',
      src: 'var depA1 = require("./depA1");' +
           'var depB = require("./depB");' +
           'module.exports = { depA1: depA1, depB: depB };'
    }, {
      filename: './test/fixtures/depA1.js',
      src: 'module.exports = "depA1";'
    }, {
      filename: './test/fixtures/depB.js',
      src: 'var depB1 = require("./depB1");' +
           'module.exports = { depB1: depB1 };'
    }, {
      filename: './test/fixtures/depB1.js',
      src: 'module.exports = "depB1";'
    }
  ];

  files.forEach(function(file) {
    fs.writeFileSync(file.filename, file.src);
  });

  require('browserify')().require('./test/fixtures/depB', { expose: 'depB' }).bundle({ debug: true }).pipe(fs.createWriteStream('./test/fixtures/depB-built.js'));

  require('browserify')().require('./test/fixtures/depA', { expose: 'depA' }).external('./test/fixtures/depB').bundle({ debug: true }).pipe(fs.createWriteStream('./test/fixtures/depA-built.js'));
})();
*/
