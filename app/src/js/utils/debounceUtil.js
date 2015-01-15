'use strict';

/**
 * Debounce a function
 * https://github.com/jashkenas/underscore
 *
 * @method debounce
 * @param {Function} [callback]
 * @param {Number} [delay]
 * @param {Boolean} [immediate]
 * @return {Function}
 */
function debounce (callback, delay, immediate) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;

    var callLater = function () {
      timeout = null;
      if (!immediate) {
        callback.apply(context, args);
      }
    };

    var callNow = immediate && !timeout;
    window.clearTimeout(timeout);
    timeout = window.setTimeout(callLater, delay);
    if (callNow) {
      callback.apply(context, args);
    }
  };
}

module.exports = debounce; 