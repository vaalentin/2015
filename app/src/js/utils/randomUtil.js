'use strict';

/**
 * Return a random value in a specified range
 *
 * @method random
 * @param {Number} [low] Lowest value possible
 * @param {Number} [high] Highest value possible
 * @param {Boolean} [round=false] Floor the value?
 * @return {Number} Random value
 */
function random (low, high, round) {
  round = round || false;
  
  var randomValue = Math.random() * (high - low) + low;

  if (round) {
    return Math.floor(randomValue);
  }
  
  return randomValue;
}

module.exports = random;