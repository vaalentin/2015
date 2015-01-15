'use strict';

var fs = require('fs');
var gulp = require('gulp');

var isScript = require('./utils/isScript');

var files = fs.readdirSync('./gulp/tasks');

for (var i = 0, j = files.length; i < j; i++) {
  var fileName = files[i];
  
  if (isScript(fileName)) {
    require('./tasks/' + fileName);
  }
}