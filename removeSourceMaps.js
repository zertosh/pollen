/**
 * Regexp are from https://github.com/thlorenz/convert-source-map
 */

'use strict';

var commentRx = /^[ \t]*(?:\/\/|\/\*)[@#][ \t]+sourceMappingURL=data:(?:application|text)\/json;base64,(.+)(?:\*\/)?/mg;

var mapFileCommentRx = /(?:^[ \t]*\/\/[@|#][ \t]+sourceMappingURL=(.+?)[ \t]*$)|(?:^[ \t]*\/\*[@#][ \t]+sourceMappingURL=(.+?)[ \t]*\*\/[ \t]*$)/mg;

module.exports = function(src) {
  return src.replace(commentRx, '').replace(mapFileCommentRx, '');
};
