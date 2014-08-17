{ expect } = require 'chai'
bust = require '../lib/gulp-css-cache-bust'
{ File } = require 'gulp-util'

describe 'gulp-css-cache-bust', ->

  it "shouldn't stop task when image doesn't exist", (done) ->
    stream = bust()
    buffer = new Buffer 'url(null.png)'
    file = new File contents: buffer
    stream.on 'data', (newFile) ->
      expect newFile.contents.toString()
      .to.be.equal 'url(null.png)'
    stream.on 'end', done
    stream.write file
    stream.end()
