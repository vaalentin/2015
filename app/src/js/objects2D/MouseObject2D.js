'use strict';

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
 * Animate wheel
 *
 * @method scroll
 */
Mouse.prototype.scroll = function () {
  this.y = this.y === 0 ? -80 : 0;

  this.$wheel.stop().animate({ opacity: 1 }, 400);

  var y = this.y;

  this.$lines.stop().animate({
      top: y + '%'
    }, 500, function () {
      this.$wheel.stop().animate({
        opacity: 0.2
      }, 300);
  }.bind(this));
};

/**
 * Start animation
 *
 * @method start
 */
Mouse.prototype.start = function () {
  this.interval = window.setInterval(function () {
    this.scroll();
  }.bind(this), 2000);
};

/**
 * Stop animation
 *
 * @method stop
 */
Mouse.prototype.stop = function () {
  window.clearInterval(this.interval);
};

module.exports = Mouse;