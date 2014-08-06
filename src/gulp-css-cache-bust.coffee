through = require 'through2'
{ PluginError, replaceExtension } = require 'gulp-util'
{ PassThrough } = require 'stream'
# { cloneextend } = require 'cloneextend'
{ resolve } = require 'path'
{ createReadStream } = require 'fs'
{ createHash } = require 'crypto'

PLUGIN_NAME = 'gulp-css-cache-bust'

module.exports = (opts = {}) ->
  # opts = cloneextend defOpts, opts

  through.obj (file, enc, callback) ->
    return callback() if file.isNull()

    if file.isBuffer()
      contents = file.contents.toString 'utf8'
      rUrl = /url\s*\(\s*['"]?(.*?)['"]?\s*\)/g
      i = 0
      done = =>
        file.contents = new Buffer contents
        @push file
        callback()
      while (result = rUrl.exec contents)?
        i++
        do (result) ->
          [matched, url] = result
          path = resolve opts.base, '.' + url
          stream = createReadStream path
          hash = createHash 'md5'
          hash.setEncoding 'hex'
          stream.on 'end', ->
            stream.removeAllListeners()
            hash.end()
            buster = hash.read().substr 0, 10
            contents = contents.replace matched, "url('#{url}?#{buster}')"
            if --i is 0
              done()
          stream.pipe hash
          matched


    throw new PluginError 'Stream is not supported' if file.isStream()
