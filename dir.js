/**
 * Kinda like `console.dir` in Chrome
 */

'use strict';

var util = require('util');
var _map = Array.prototype.map;

var DEFAULTS = {
  showHidden: true,
  depth: 8,
  colors: true
};

function inspect(arg) {
  return util.inspect(arg, DEFAULTS);
}

module.exports = function() {
  console.log.apply(console, _map.call(arguments, inspect));
};
