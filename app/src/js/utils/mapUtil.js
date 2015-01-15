'use strict';

/**
 * Map a value from one range to another
 *
 * @method map
 * @param {Number} [value] Value to map
 * @param {Array} [oldRange] Range to map from
 * @param {Array} [newRange] Range to map to
 * @return {Number} Mapped value
 */
function map (value, oldRange, newRange) {
  var newValue = (value - oldRange[0]) * (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]) + newRange[0];
  return Math.min(Math.max(newValue, newRange[0]) , newRange[1]);
}

module.exports = map;