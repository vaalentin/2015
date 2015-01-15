'use strict';

/**
 * Set loop on a TweenLite tween
 * must be passed on onComplete
 */
function loop () {
  this.restart();
}

module.exports = loop;