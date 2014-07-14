/* jshint mocha: true */

'use strict';

var removeSourceMaps = require('../removeSourceMaps');

describe('removeSourceMaps', function() {

  it('should be requireable', function() {
    removeSourceMaps.should.be.a.Function;
  });

});
