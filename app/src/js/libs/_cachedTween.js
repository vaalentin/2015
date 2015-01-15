'use strict';

var map = require('../utils/mapUtil');

var CACHEDTWEEN = CACHEDTWEEN || (function () {
  return {};
})();

/**
 * Easing
 * Equations from Robert Penner
 *
 * @module CACHEDTWEEN.Easing
 * @param {Number} [t] Current time
 * @param {Number} [b] Start value
 * @param {Number} [c] Change in value (range)
 * @param {Number} [d] Duration (1 here)
 */
CACHEDTWEEN.Easing = {
  Linear: function (t, b, c, d) {
    return c * t / d + b;
  },

  Quadratic: {
    In: function (t, b, c, d) {
      return c * (t /= d) * t + b;
    },

    Out: function (t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },

    InOut: function (t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
  }
};

/**
 * @class CACHEDTWEEN.Tween
 * @constructor
 * @param {Object} [from]
 * @return {this}
 */
CACHEDTWEEN.Tween = function (from) {
  this._easing = CACHEDTWEEN.Easing.Linear;
  this._from = from;
  return this;
};

/**
 * @method to
 * @param {Object} [to]
 * @return {this}
 */
CACHEDTWEEN.Tween.prototype.to = function (to) {
  this._to = to;
  return this;
};

/**
 * @method easing
 * @param {Function} [easing]
 * @return {this}
 */
CACHEDTWEEN.Tween.prototype.easing = function (easing) {
  this._easing = easing;
  return this;
};
  
/**
 * @method precision
 * @param {Number} [precision=1]
 * @return {this}
 */
CACHEDTWEEN.Tween.prototype.cache = function (precision) {
  precision = precision || 1;
  var steps = 100 * precision;

  var cache = {};

  for (var i = 0; i <= steps; i++) {
    var percent = Math.floor((i / precision) * 100) / 100;
    cache[percent] = this.get(percent);
  }

  this._cachePrecision = precision;
  this._cache = cache;

  return this;
};

/**
 * Limit the tween between 2 values
 *
 * @method limit
 * @param {Array} [range]
 * @return {this}
 */
CACHEDTWEEN.Tween.prototype.limit = function (range) {
  if (range[0] > range[1]) {
    var tmp = range[0];
    range[0] = range[1];
    range[1] = tmp;
  }

  this._limit = range;
  return this;
};

/**
 * @method get
 * @param {Number} [percent]
 * @return {Object}
 */
CACHEDTWEEN.Tween.prototype.get = function (percent) {
  if (this._limit) {
    if (percent < this._limit[0]) {
      percent = this._limit[0];
    } else if (percent > this._limit[1]) {
      percent = this._limit[1];
    }
    percent = map(percent, this._limit, [0, 100]);
  }

  if (this._cache) {
    if (this._cache[percent]) {
      return this._cache[percent];
    } else {
      return this._cache[Math.floor(percent)];
    }
  } else {
    var values = {};

    // percent act as time
    for (var key in this._from) {
      if (this._from.hasOwnProperty(key) && this._to.hasOwnProperty(key)) {
        values[key] = this._easing(
          percent / 100,
          this._from[key],
          this._to[key] - this._from[key],
          1
        );
      }
    }

    return values;
  }
};

module.exports = CACHEDTWEEN;