'use strict';

var jQuery = require('jquery');

/**
 * Preloader
 *
 * @class Loader
 * @constructor
 * @requires jQuery
 */
function Loader () {
  this.$el = jQuery('.loader');
  this.$title = this.$el.find('.loader__title');
  this.$progress = this.$el.find('.loader__progress');
}

/**
 * Out animation
 *
 * @method out
 */
Loader.prototype.out = function () {
  var _this = this;

  this.$progress.stop().animate({ width: '100%' }, 1000, function () {
    _this.$el.animate({ opacity: 0 }, 1000, function () {
      _this.$el.css('display', 'none');
    });

    _this.$title.animate({ top: '-10%', opacity: 0 }, 500);
    _this.$progress.animate({ height: 0 }, 400);
  });
};

/**
 * Update the percent loaded
 *
 * @method update
 * @param {Number} [percent]
 */
Loader.prototype.update = function (percent) {
  // this.$progress.stop().animate({ width: percent + '%'}, 500);
};

module.exports = Loader;