'use strict';

/**
 * Throttle a function
 * https://github.com/jashkenas/underscore
 *
 * @method throttle
 * @param {Function} [callback]
 * @param {Number} [delay]
 * @param {Boolean} [leading]
 * @param {Boolean} [trailing]
 * @return {Function}
 */
function throttle (callback, delay, leading, trailing) {
  leading = leading || false;
  trailing = trailing || false;
  var context;
  var args;
  var result;
  var timeout = null;
  var previous = 0;

  var callLater = function () {
    previous = leading ? new Date().getTime() : 0;
    timeout = null;
    result = callback.apply(context, args);
    if (!timeout) {
      context = null;
      args = null;
    }
  };

  return function () {
    var now = new Date().getTime();
    if (!previous && !leading) {
      previous = now;
    }
    var remaining = delay - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > delay) {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = callback.apply(context, args);
      if (!timeout) {
        context = null;
        args = null;
      }
    } else if (!timeout && !trailing) {
      timeout = window.setTimeout(callLater, remaining);
    }

    return result;
  };

}

module.exports = throttle;