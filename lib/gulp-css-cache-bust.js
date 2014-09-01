var PLUGIN_NAME, PluginError, assign, clone, createHash, createReadStream, defOpts, exists, parse, resolve, through, _ref, _ref1;
through = require('through2');
PluginError = require('gulp-util').PluginError;
resolve = require('path').resolve;
parse = require('url').parse;
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
    var contents, counter, done, matched, path, pathname, rUrl, replaceMap, result, url;
    replaceMap = {};
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
      counter = 0;
      done = (function(_this) {
        return function() {
          var after, before;
          counter--;
          if (counter > 0) {
            return;
          }
          for (before in replaceMap) {
            after = replaceMap[before];
            contents = contents.split(before).join(after);
          }
          file.contents = new Buffer(contents);
          _this.push(file);
          return callback();
        };
      })(this);
      while ((result = rUrl.exec(contents)) != null) {
        matched = result[0], url = result[1];
        pathname = parse(url).pathname;
        if (opts.base !== '' && pathname.charAt(0) === '/') {
          path = resolve(opts.base, pathname.substr(1));
        } else {
          path = resolve(opts.base, pathname);
        }
        if (replaceMap[matched] != null) {
          continue;
        }
        replaceMap[matched] = matched;
        counter++;
        (function(matched, pathname, path) {
          return exists(path, function(isExists) {
            var hash, stream;
            if (!isExists) {
              done();
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
              replaceMap[matched] = "url(\"" + pathname + "?" + buster + "\")";
              return done();
            });
            return stream.pipe(hash);
          });
        })(matched, pathname, path);
      }
    }
    if (file.isStream()) {
      throw new PluginError(PLUGIN_NAME, 'Stream is not supported');
    }
  });
};
