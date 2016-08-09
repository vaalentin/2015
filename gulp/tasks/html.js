'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var minify = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');

var pkg = require('../utils/pkg');

gulp.task('html', function () {

  gulp.src([
      './app/src/**/*.html',
      '!./app/src/{vendor,vendor/**}'
    ])
    .pipe(pkg.debug || false ? gutil.noop() : minify({
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
      keepClosingSlash: true
    }))
    .pipe(gulp.dest('./'))
    .pipe(notify({ title: 'Html', message: 'Success', sound: 'Morse' }));
  
  if(pkg.watch) {
    gulp.watch([
        './app/src/**/*.html',
        '!./app/src/{vendor,vendor/**}'
      ], function (file) {
        gulp.src(file.path)
          .pipe(pkg.debug || false ? gutil.noop() : minify())
          .pipe(gulp.dest('./'))
          .pipe(notify({ title: 'Html', message: 'Success', sound: 'Morse' }));
      });
  }
});
