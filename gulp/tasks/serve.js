'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');

gulp.task('serve', function  () {
  connect.server({
    root: './',
    port: 8000
  });
});