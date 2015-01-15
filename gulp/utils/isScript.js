'use strict';

/**
 * Check if script.
 *
 * @method isScript
 * @param {String} [name]
 * @return {Boolean}
 */
function isScript (name) {
  var parts = name.split('.');
  var extension = parts[parts.length - 1];

  return extension === 'js' || extension === 'coffee';
}

module.exports = isScript;