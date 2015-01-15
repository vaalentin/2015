'use strict';

var jQuery = require('jquery');

/**
 * Animated mouse
 *
 * @class Mouse
 * @constructor
 * @requires jQuery
 */
function Mouse ($el) {
  this.$el = $el;

  this.$wheel = this.$el.find('.mouse__wheel');
  this.$lines = this.$wheel.find('.mouse__wheel__lines');

  this.interval = null;
  this.y = 0;
}

/**
 * Animate the wheel
 *
 * @method scroll
 */
Mouse.prototype.scroll = function () {
  this.y = this.y === 0 ? -80 : 0;

  var _this = this;

  this.$wheel.stop().animate({ opacity: 1 }, 400);

  this.$lines.stop().animate({
      top: _this.y + '%'
    }, 500, function () {
      _this.$wheel.stop().animate({
        opacity: 0.2
      }, 300);
  });
};

/**
 * Start the animation
 *
 * @method start
 */
Mouse.prototype.start = function () {
  var _this = this;

  this.interval = window.setInterval(function () {
    _this.scroll();
  }, 2000);
};

/**
 * Stop the animation
 *
 * @method stop
 */
Mouse.prototype.stop = function () {
  window.clearInterval(this.interval);
};

module.exports = Mouse;