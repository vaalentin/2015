'use strict';

/**
 * Split path.
 *
 * @method splitPath
 * @param {String} [fullPath] Path to process
 * @return {Object} [data]
 * @return {String} [data.file] Filename
 * @return {String} [data.path] Path to the file
 */
function splitPath (fullPath) {
  var parts = fullPath.split('/');

  var file = parts.pop();
  var path = parts.join('/');

  return {
    file: file,
    path: path
  }
}

module.exports = splitPath;