/**
 * Conditional streams based on NODE_ENV
 */

'use strict';

var through = require('through2');
var _slice = Array.prototype.slice;

module.exports.ifEnv = function(env, fn) {
  var args = _slice.call(arguments, 2);
  return conditional(process.env.NODE_ENV === env, fn, args);
};

module.exports.unlessEnv = function(env, fn) {
  var args = _slice.call(arguments, 2);
  return conditional(process.env.NODE_ENV !== env, fn, args);
};

function conditional(cond, fn, args) {
  return (typeof fn === 'function') ? (cond ? fn.apply(null, args) : through.obj()) : cond;
}
