'use strict';

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');

var pkg = require('../utils/pkg');
var splitPath = require('../utils/splitPath');

function vendor (dependencies, output, message) {
  message = message || 'Vendor';

  var outputDetails = splitPath(output);

  var paths = [];

  for (var name in pkg.vendor) {
    if (pkg.vendor.hasOwnProperty(name)) {
      if (dependencies.indexOf(name) !== -1) {
        var path = pkg.vendor[name];
        paths.push(path);
      }
    }
  }

  return gulp.src(paths)
    .pipe(concat(outputDetails.file))
    .pipe(pkg.debug || false ? gutil.noop() : uglify())
    .pipe(gulp.dest(outputDetails.path))
    .pipe(notify({ title: message, message: 'Success', sound: 'Morse' }));
}

gulp.task('vendor:3D', function () {
  vendor(
    [
      'jquery',
      'three',
      'tweenlite',
      'tweenlite.easing',
      'tweenlite.bezier',
      'tweenlite.css',
      'tweenlite.jquery',
      'howler',
      'visibly'
    ],
    './app/dist/js/3D/vendor.js',
    'Vendor 3D'
  );
});

gulp.task('vendor:2D', function () {
  vendor(
    [
      'jquery',
      'tweenlite',
      'tweenlite.css',
      'tweenlite.jquery',
      'skrollr'
    ],
    './app/dist/js/2D/vendor.js',
    'Vendor 2D'
  );
});

gulp.task('vendor', ['vendor:2D', 'vendor:3D']);