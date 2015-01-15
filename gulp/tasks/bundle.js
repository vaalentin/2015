'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

var splitPath = require('../utils/splitPath');

function bundle (entries, output, title) {
  title = title || 'Bundle';

  var outputDetails = splitPath(output);

  return gulp.src(entries)
    .pipe(concat(outputDetails.file))
    .pipe(gulp.dest(outputDetails.path))
    .pipe(notify({ title: title, message: 'Success', sound: 'Morse' }));

}

gulp.task('bundle:3D', function () {
  bundle(
    ['./app/dist/js/3D/vendor.js', './app/dist/js/3D/main.js'],
    './app/dist/js/3D/bundle.js',
    'Bundle 3D'
  );
});

gulp.task('bundle:2D', function () {
  bundle(
    ['./app/dist/js/2D/vendor.js', './app/dist/js/2D/main.js'],
    './app/dist/js/2D/bundle.js',
    'Bundle 2D'
  );
});

gulp.task('bundle', ['bundle:2D', 'bundle:3D']);