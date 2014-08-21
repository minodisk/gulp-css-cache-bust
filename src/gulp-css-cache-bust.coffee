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
    replaceMap = {}

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
      counter = 0
      done = =>
        counter--
        return if counter > 0

        for before, after of replaceMap
          # console.log 'replace:', before, '->', after
          contents = contents.split(before).join(after)

        # console.log 'done:', file.path

        file.contents = new Buffer contents
        @push file
        callback()

      while (result = rUrl.exec contents)?
        [matched, url] = result
        path = resolve opts.base, '.' + url
        continue if replaceMap[matched]?
        replaceMap[matched] = ''

        counter++
        do (matched, url, path) ->
          # console.log 'start:', url
          exists path, (isExists) ->
            unless isExists
              done()
              return

            # console.log 'read hash:', path

            stream = createReadStream path
            hash = createHash 'md5'
            hash.setEncoding 'hex'
            stream.on 'end', ->
              stream.removeAllListeners()
              hash.end()
              buster = hash.read().substr 0, 10
              replaceMap[matched] = """url("#{url}?#{buster}")"""
              done()
            stream.pipe hash

    throw new PluginError PLUGIN_NAME, 'Stream is not supported' if file.isStream()
