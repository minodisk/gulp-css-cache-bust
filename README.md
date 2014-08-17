# [gulp](http://gulpjs.com)-css-cache-bust [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

> Bust cache in CSS

*Add [md5sum](http://en.wikipedia.org/wiki/Md5sum) as search query to file reference.*


## Install

```bash
$ npm install --save-dev gulp-css-cache-bust
```


## Usage

```js
var gulp = require('gulp');
var bust = require('gulp-css-cache-bust');

gulp.task('default', function () {
  return gulp.src('index.css')
  .pipe(bust());
});
```


## API

### bust(options)


#### options.base

Type: `string`
Default: `null`

Root path used when specified the path starting with `/`.


[npm-url]: https://npmjs.org/package/gulp-css-cache-bust
[npm-image]: https://badge.fury.io/js/gulp-css-cache-bust.svg
[travis-url]: http://travis-ci.org/minodisk/gulp-css-cache-bust
[travis-image]: https://secure.travis-ci.org/minodisk/gulp-css-cache-bust.svg?branch=master
[coveralls-image]: https://img.shields.io/coveralls/minodisk/gulp-css-cache-bust.svg
[coveralls-url]: https://coveralls.io/r/minodisk/gulp-css-cache-bust
