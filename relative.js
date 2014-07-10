'use strict';

var path = require('path');
var cwd = process.cwd();

module.exports = function(to) {
  return (typeof to === 'string') ? path.relative(cwd, to) : '';
};
