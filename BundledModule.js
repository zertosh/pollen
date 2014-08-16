/**
 * Load standalone browserify bundles for node.js use
 */

'use strict';

var assert = require('assert');
var fs = require('fs');

/**
 * @param {string} filename
 * @param {object} opts
 * @param {boolean=} opts.hotreplace
 * @constructor
 */
function BundledModule(filename, opts) {
  if (!(this instanceof BundledModule)) {
    return new BundledModule(filename, opts);
  }

  assert.ok(typeof filename === 'string',
    'BundledModule requires "filename"');

  this._filename = require.resolve(filename);
  this._hotreplace = opts && opts.hasOwnProperty('hotreplace')
      ? !!opts.hotreplace : process.env.NODE_ENV !== 'production';
}

/**
 * Stores the file path, raw source, and mtime of each module file
 */
BundledModule.prototype._mtime = null;

/**
 * The return value of the stiched module after running it.
 */
BundledModule.prototype._exports = null;

/**
 * @return {Object?}
 */
BundledModule.prototype.exports = function() {
  var currentMTime;
  if (!this._mtime) {
    this._mtime = currentMTime = readMTime(this._filename);
  }
  if (this._hotreplace) {
    if (!currentMTime) {
      currentMTime = readMTime(this._filename);
    }
    if (currentMTime !== this._mtime) {
      this._exports = null;
      this._mtime = currentMTime;
      delete require.cache[this._filename];
    }
  }
  if (!this._exports) {
    this._exports = require(this._filename);
  }
  return this._exports;
};

/**
 * Removes the module from the cache, and clears the `exports`/`mtime`,
 * so that calling `exports` reloads the module.
 * @return {BundledModule}
 */
BundledModule.prototype.reset = function() {
  this._mtime = this._exports = null;
  delete require.cache[this._filename];
  return this;
};

function readMTime(file) {
  return fs.statSync(file).mtime.getTime();
}

module.exports = BundledModule;
