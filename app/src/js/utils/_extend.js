'use strict';

/**
* Merge defaults with user options
*
* @param {Object} defaults Default settings
* @param {Object} options User options
* @returns {Object} Merged values of defaults and options
*/
// var extend = function (defaults, options) {
//   var extended = {};
//   var prop;
//   for (prop in defaults) {
//     if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
//       extended[prop] = defaults[prop];
//     }
//   }
//   for (prop in options) {
//     if (Object.prototype.hasOwnProperty.call(options, prop)) {
//       extended[prop] = options[prop];
//     }
//   }
//   return extended;
// };

/**
 * Merge two or more objects
 * from underscore.js
 *
 * @param {Object} Object to merge to
 * @param {Object} Objects to merge
 * @return {Object}
 */
function extend (obj) {
  var source;

  for (var i = 1, j = arguments.length; i < j; i++) {
    source = arguments[i];
    for (var prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        obj[prop] = source[prop];
      }
    }
  }

  return obj;
}

module.exports = extend;

