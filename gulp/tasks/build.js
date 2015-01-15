'use strict';

var gulp = require('gulp');

gulp.task(
  'build',
  ['html', 'vendor', 'scripts', 'styles']
);

gulp.task(
  'build:3D',
  ['html', 'vendor:3D', 'scripts:3D', 'styles:3D']
);

gulp.task(
  'build:2D',
  ['html', 'vendor:2D', 'scripts:2D', 'styles:2D']
);