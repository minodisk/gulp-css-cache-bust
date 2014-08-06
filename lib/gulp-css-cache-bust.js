var PLUGIN_NAME, PassThrough, PluginError, createHash, createReadStream, replaceExtension, resolve, through, _ref;
through = require('through2');
_ref = require('gulp-util'), PluginError = _ref.PluginError, replaceExtension = _ref.replaceExtension;
PassThrough = require('stream').PassThrough;
resolve = require('path').resolve;
createReadStream = require('fs').createReadStream;
createHash = require('crypto').createHash;
PLUGIN_NAME = 'gulp-css-cache-bust';
module.exports = function(opts) {
  if (opts == null) {
    opts = {};
  }
  return through.obj(function(file, enc, callback) {
    var contents, done, i, rUrl, result;
    if (file.isNull()) {
      return callback();
    }
    if (file.isBuffer()) {
      contents = file.contents.toString('utf8');
      rUrl = /url\s*\(\s*['"]?(.*?)['"]?\s*\)/g;
      i = 0;
      done = (function(_this) {
        return function() {
          file.contents = new Buffer(contents);
          _this.push(file);
          return callback();
        };
      })(this);
      while ((result = rUrl.exec(contents)) != null) {
        i++;
        (function(result) {
          var hash, matched, path, stream, url;
          matched = result[0], url = result[1];
          path = resolve(opts.base, '.' + url);
          stream = createReadStream(path);
          hash = createHash('md5');
          hash.setEncoding('hex');
          stream.on('end', function() {
            var buster;
            stream.removeAllListeners();
            hash.end();
            buster = hash.read().substr(0, 10);
            contents = contents.replace(matched, "url('" + url + "?" + buster + "')");
            if (--i === 0) {
              return done();
            }
          });
          stream.pipe(hash);
          return matched;
        })(result);
      }
    }
    if (file.isStream()) {
      throw new PluginError('Stream is not supported');
    }
  });
};
