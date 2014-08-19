through = require 'through2'
{ PluginError } = require 'gulp-util'
{ resolve } = require 'path'
{ exists, createReadStream } = require 'fs'
{ createHash } = require 'crypto'
{ clone, assign } = require 'lodash'

PLUGIN_NAME = 'gulp-css-cache-bust'

defOpts =
  base: ''

module.exports = (opts = {}) ->
  opts = assign clone(defOpts), opts

  through.obj (file, enc, callback) ->
    if file.isNull()
      @push file
      callback()
      return

    if file.isBuffer()
      contents = file.contents.toString 'utf8'
      unless /url\s*\(\s*['"]?(.*?)['"]?\s*\)/.test contents
        @push file
        callback()
        return

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

          exists path, (isExists) ->
            unless isExists
              if --i is 0
                done()
              return

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

    throw new PluginError PLUGIN_NAME, 'Stream is not supported' if file.isStream()
