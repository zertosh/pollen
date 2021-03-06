// Browserify plugin to save failed build messages to the output file

'use strict';

var through = require('through2');
var chalk = require('chalk');

var log = console.log.bind(console);

module.exports = function(b, opts) {

  var logger = opts && opts.logger || log;
  var bundle = b.bundle.bind(b);

  b.bundle = function(cb) {

    var stream = through();

    bundle(function(err, src) {

      if (err) {
        logger(chalk.red(err.toString()));
        src = stringifyFn(function(data) {
          window.alert(data);
        }, err.toString() );
        // Don't emit 'error', otherwise the pipeline will die
        b.emit('_error', err);
      }

      if (cb) {
        cb(null, src);
      }

      stream.push(src);
      stream.push(null);
    });

    return stream;
  };

};

function stringifyFn(fn, data) {
  return '(' + fn.toString() + ')(' + (data ? JSON.stringify(data) : '') + ')';
}
