/**
 * Load pre-built browserify bundles for node.js use
 * @module server/BundlesModule
 */

'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var removeSourceMaps = require('./removeSourceMaps');

/**
 * @param {object} opts
 * @param {string[]} opts.files
 * @param {boolean=} opts.hotreplace
 * @param {string=} opts.name
 * @param {boolean=} opts.nocache
 * @constructor
 */
function BundlesModule(opts) {
  if (!(this instanceof BundlesModule)) {
    return new BundlesModule(opts);
  }

  assert.ok(opts,
    'BundlesModule requires "opts"');
  assert.ok(Array.isArray(opts.files),
    'BundlesModule "opts.files" must be an array');
  assert.ok(opts.files.length && opts.files.every(isString),
    'BundlesModule "opts.files" must have strings');

  this._files = opts.files.map(relative);
  this._nocache = !!opts.nocache;
  this._name = opts.name || 'bundle.js';
  this._hotreplace = opts.hasOwnProperty('hotreplace')
      ? !!opts.hotreplace : process.env.NODE_ENV !== 'production';
}

/**
 * Stores the file path, raw source, and mtime of each module file
 */
BundlesModule.prototype._packs = null;

/**
 * The source of the stiched module derived from the `_packs`.
 */
BundlesModule.prototype._code = null;

/**
 * The return value of the stiched module after running it.
 */
BundlesModule.prototype._exports = null;

/**
 * The most important function. Reads any files if necessary, and runs
 * the stitched code. The return value is the "require" function from
 * the Browserify bundles.
 *
 * @return {function}
 */
BundlesModule.prototype.exports = function() {
  if (this._exports && !this._hotreplace) {
    return this._exports;
  }
  if (!this._packs || !this._code || this._hotreplace) {
    this.read();
  }
  var _exports = this._exports || vm.runInThisContext(this._code, this._name);
  if (!this._nocache) this._exports = _exports;
  return _exports;
};

/**
 * Read the files into packs if necessary, update on "hotreplace",
 * and stitch the files.
 *
 * @return {BundlesModule}
 */
BundlesModule.prototype.read = function() {
  if (!this._packs) {
    this._packs = filesToPacks(this._files);
    this._code = this._exports = null;
  } else if (this._hotreplace) {
    var updatedPacks = updatePacks(this._packs);
    if (updatedPacks !== this._packs) {
      this._packs = updatedPacks;
      this._code = this._exports = null;
    }
  }
  if (!this._code) {
    this._code = stitch(this._name, this._packs);
    this._exports = null;
  }
  return this;
};



/**
 * Removes the `exports`, but keeps the sources that have already been read and
 * stitched. Basically, this removes the value returned from `vm.runInThisContext`.
 *
 * Use `uncache` if you need multiple distinct instances of the `exports`.
 * Since the `exports` are distinct instances, you get the benefits of each
 * having their own state. But, this is likely very unperformant.
 *
 * @return {BundlesModule}
 */
BundlesModule.prototype.uncache = function() {
  this._exports = null;
  return this;
};

/**
 * Removes the `exports`, the sources - everything.
 * @return {BundlesModule}
 */
BundlesModule.prototype.reset = function() {
  this._packs = this._code = this._exports = null;
  return this;
};


/**
 * Build the "packs" from an array of filenames
 */
function filesToPacks(files) {
  return files.map(function(id) {
    return {
      id: id,
      source: readFile(id),
      mtime: readMTime(id)
    };
  });
}

/**
 * Updated the "packs" if the mtime has changed
 */
function updatePacks(packs) {
  var didUpdate = false;
  var updated = packs.map(function(pack) {
    var mtime_ = readMTime(pack.id);
    if (pack.mtime !== mtime_) {
      didUpdate = true;
      return {
        id: pack.id,
        source: readFile(pack.id),
        mtime: mtime_
      };
    } else {
      return pack;
    }
  });
  return didUpdate ? updated : packs;
}

/**
 * Turn the source from the "packs" into a single module to be run,
 * while preserving the source maps.
 *
 * This assumes that the Browserify bundles included all expose
 * whatever they need to via a `require` function. The bundle sources
 * are wrapped in a function with it's own `require` variable so the
 * Browserify one doesn't leak out into the global scope.
 *
 * TODO: Sourcemaps
 *
 * @param {string} name
 * @param {packs} packs
 * @return {string}
 */
function stitch(name, packs) {
  var content = ';(function(require){\n';
  packs.forEach(function(pack) {
    content += removeSourceMaps(pack.source);
    if (content[content.length-1] !== '\n') content += '\n';
  });
  content += '\nreturn require;}());\n';
  return content;
}

function relative(file) {
  return path.relative(process.cwd(), file);
}

function readMTime(file) {
  return fs.statSync(file).mtime.getTime();
}

function readFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function isString(thing) {
  return typeof thing === 'string';
}

module.exports = BundlesModule;
