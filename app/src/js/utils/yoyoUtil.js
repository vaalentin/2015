'use strict';

/**
 * Set yoyo on a TweenLite tween
 * must be passed on onComplete and onReverseComplete
 */
function yoyo () {
  if (this.reversed()) {
    this.restart();
  } else {
    this.reverse();
  }
}

module.exports = yoyo;