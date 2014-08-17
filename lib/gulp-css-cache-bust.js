var PLUGIN_NAME, PluginError, assign, clone, createHash, createReadStream, defOpts, exists, resolve, through, _ref, _ref1;
through = require('through2');
PluginError = require('gulp-util').PluginError;
resolve = require('path').resolve;
_ref = require('fs'), exists = _ref.exists, createReadStream = _ref.createReadStream;
createHash = require('crypto').createHash;
_ref1 = require('lodash'), clone = _ref1.clone, assign = _ref1.assign;
PLUGIN_NAME = 'gulp-css-cache-bust';
defOpts = {
  base: ''
};
module.exports = function(opts) {
  if (opts == null) {
    opts = {};
  }
  opts = assign(clone(defOpts), opts);
  return through.obj(function(file, enc, callback) {
    var contents, done, i, rUrl, result;
    if (file.isNull()) {
      this.push(file);
      callback();
      return;
    }
    if (file.isBuffer()) {
      contents = file.contents.toString('utf8');
      if (!/url\s*\(\s*['"]?(.*?)['"]?\s*\)/.test(contents)) {
        this.push(file);
        callback();
        return;
      }
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
          var matched, path, url;
          matched = result[0], url = result[1];
          path = resolve(opts.base, '.' + url);
          return exists(path, function(isExists) {
            var hash, stream;
            if (!isExists) {
              if (--i === 0) {
                done();
              }
              return;
            }
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
          });
        })(result);
      }
    }
    if (file.isStream()) {
      throw new PluginError('Stream is not supported');
    }
  });
};
