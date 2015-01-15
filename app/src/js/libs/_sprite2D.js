'use strict';

var jQuery = require('jquery');

/**
 * Sprite animation on a dom element using background-position
 *
 * @module SPRITE2D
 * @requires jQuery
 */
var SPRITE2D = SPRITE2D || (function () {
  
  var sprites = [];

  return {
    /**
     * Add a new Sprite to the render queue
     *
     * @method add
     * @param {SPRITE2D.Sprite} [Sprite]
     */
    add: function (Sprite) {
      sprites.push(Sprite);
    },

    /**
     * Remove a Sprite from the render queue
     *
     * @method remove
     * @param {SPRITE2D.Sprite} [Sprite]
     */
    remove: function (Sprite) {
      var i = sprites.indexOf(Sprite);

      if (i !== -1) {
        sprites.splice(i, 1);
      }
    },

    /**
     * Start all the queued sprites
     *
     * @method start
     */
    start: function () {
      for (var i = 0, j = sprites.length; i < j; i++) {
        sprites[i].start();
      }
    },

    /**
     * Stop all the queued sprites
     *
     * @method stop
     */
    stop: function () {
      for (var i = 0, j = sprites.length; i < j; i++) {
        sprites[i].stop();
      }
    }
  };
})();

/**
 * Sprite
 *
 * @class SPRITE2D.Sprite
 * @constructor
 * @param {jQuery object} [$el]
 * @param {Object} [options]
 * @params {Number} [options.duration=100] Time per image
 * @params {Number} [options.framesPerRow=10] Number of steps on each row
 * @params {Number} [options.total=1] Total steps
 * @params {Boolean} [options.loop=true] Loop?
 * @requires SPRITE2D, jQuery
 */
SPRITE2D.Sprite = function ($el, options) {
  this.$el = $el;

  this.parameters = jQuery.extend({
    loop: false,
    total: 1,
    duration: 100,
    framesPerRow: 10
  }, options);

  this.frame = { width: this.$el.width(), height: this.$el.height() };
  this.position = { top: 0, left: 0 };
  this.totalWidth = this.parameters.framesPerRow * this.frame.width;
  this.currentFrame = 0;
  this.isPlaying = false;
};

/**
 * Start the animation (add it to render queue)
 *
 * @method start
 */
SPRITE2D.Sprite.prototype.start = function () {
  if (this.isPlaying) {
    return false;
  }

  SPRITE2D.add(this);

  this.isPlaying = true;

  var _this = this;

  this.interval = window.setInterval(function () {
    _this.$el.css(
      'backgroundPosition',
      '-' + _this.position.left + 'px -' + _this.position.top + 'px'
    );

    _this.position.left += _this.frame.width;

    if (_this.currentFrame === _this.parameters.total - 1) {
      if (!_this.parameters.loop) {
        // Over, remove from SPRITE2D
        SPRITE2D.remove(_this);
        window.clearInterval(_this.interval);
        _this.isPlaying = false;

      } else {
        // Reset
        _this.currentFrame = 0;
        _this.position.top = _this.position.left = 0;
      }
    }

    _this.currentFrame++;

    // next line
    if (_this.position.left > _this.totalWidth - _this.frame.width) {
      _this.position.top += _this.frame.height;
      _this.position.left = 0;
    }
  }, this.parameters.duration);
};

/**
 * Stop the animation (remove it from render queue)
 *
 * @method stop
 */
SPRITE2D.Sprite.prototype.stop = function () {
  if (!this.isPlaying) {
    return false;
  }

  this.isPlaying = false;

  window.clearInterval(this.interval);
};

module.exports = SPRITE2D;