'use strict';
  
var jQuery = require('jquery');
var THREE = require('three');

/**
 * Sprite animation on a mesh using texture's offset
 *
 * @module SPRITE3D
 * @requires jQuery, THREE
 */
var SPRITE3D = SPRITE3D || (function () {
  var sprites = [];
  var previousTime = Date.now();

  return {
    /**
     * Add a new Sprite to the render queue
     *
     * @method add
     * @param {SPRITE3D.Sprite} [Sprite]
     */
    add: function (Sprite) {
      // update previousTime to avoid frame jumping
      // if inactive for too long
      if (sprites.length === 0) {
        previousTime = Date.now();
      }

      sprites.push(Sprite);
    },

    /**
     * Remove a Sprite from the render queue
     *
     * @method remove
     * @param {SPRITE3D.Sprite} [Sprite]
     */
    remove: function (Sprite) {
      var i = sprites.indexOf(Sprite);

      if (i !== -1) {
        sprites.splice(i, 1);
      }
    },

    /**
     * Update Sprites in the render queue
     *
     * @method update
     */
    update: function () {
      if (!sprites.length) {
        return false;
      }

      var time = Date.now();
      var delta = time - previousTime;
      previousTime = time;

      var i = 0;

      while (i < sprites.length) {
        if (sprites[i].update(delta)) {
          i++;
        } else {
          sprites.splice(i, 1);
        }
      }
    }
  };
})();

/**
 * Sprite
 *
 * @class SPRITE3D.Sprite
 * @constructor
 * @param {THREE.Texture} [texture]
 * @param {Object} [options]
 * @params {Number} [options.duration=100] Time per image
 * @params {Number} [options.horizontal=1] Horizontal steps
 * @params {Number} [options.vertical=1] Vertical steps
 * @params {Number} [options.total=1] Total steps
 * @params {Boolean} [options.loop=true] Loop?
 * @requires SPRITE3D, jQuery, THREE
 */
SPRITE3D.Sprite = function (texture, options) {
  this.texture = texture;

  this.parameters = jQuery.extend({
    duration: 100,
    horizontal: 1,
    vertical: 1,
    total: 1,
    loop: true
  }, options);

  this.texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
  this.texture.repeat.set(1 / this.parameters.horizontal, 1 / this.parameters.vertical);
  this.texture.offset.x = this.texture.offset.y = 1;

  this.isPlaying = false;
  this.current = 0;
  this.currentTime = 0;
};

/**
 * Start the animation (add it to render queue)
 *
 * @method start
 */
SPRITE3D.Sprite.prototype.start = function () {
  if (this.isPlaying) {
    return false;
  }

  SPRITE3D.add(this);

  this.isPlaying = true;
};

/**
 * Stop the animation (remove it from render queue)
 *
 * @method stop
 */
SPRITE3D.Sprite.prototype.stop = function () {
  if (!this.isPlaying) {
    return false;
  }

  SPRITE3D.remove(this);

  this.isPlaying = false;
};

/**
 * Update thre Sprite
 *
 * @method update
 * @param {Number} [delta] Time delta (time elapsed since last update)
 */
SPRITE3D.Sprite.prototype.update = function (delta) {
  this.currentTime += delta;

  while (this.currentTime > this.parameters.duration) {
    this.currentTime -= this.parameters.duration;

    this.current++;

    if (this.current === this.parameters.total - 1) {
      if (this.parameters.loop) {
        this.current = 0;  
      } else {
        this.current = 0;
        this.stop();
        return false;
      }
    }

    var factor = this.parameters.total - this.current;

    var row = Math.floor(factor / this.parameters.horizontal);
    var col = Math.floor(factor % this.parameters.horizontal);

    this.texture.offset.x = col / this.parameters.horizontal;
    this.texture.offset.y = row / this.parameters.vertical;
  }

  return true;
};

module.exports = SPRITE3D;