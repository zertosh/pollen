'use strict';

module.exports = function(str, suffix) {
  return (typeof str === 'string' && typeof suffix === 'string') ?
          str.indexOf(suffix, str.length - suffix.length) !== -1 :
          false;
};
