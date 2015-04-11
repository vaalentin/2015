'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var loop = require('../utils/loopUtil');

/**
 * Animated water ripple
 *
 * @class Drop
 * @constructor
 * @param {Object} [options]
 * @param {Number} [options.count=6] Rings number
 * @param {String} [options.color='#ffffff'] Rings color
 * @param {Number} [options.amplitude=2] Rings max expanded amplitude 
 * @requires jQuery, THREE, TweenLite, loop
 */
function Drop (options) {
  this.parameters = jQuery.extend(Drop.defaultOptions, options);

  var group = new THREE.Object3D();

  var plane = this.getPlane();

  var caches = [];
  var idleTweens = [];

  for (var i = 0; i < this.parameters.count; i++) {
    var planeCopy = plane.clone();
    planeCopy.material = planeCopy.material.clone();

    var tween = this.getTween(planeCopy, i);
    var cache = { duration: (10 + i) / 10, z: (this.parameters.count - i) * 5 };

    group.add(planeCopy);
    caches.push(cache);
    idleTweens.push(tween);
  }

  this.el = group;

  this.in = function () {
    for (var i = 0, j = group.children.length; i < j; i++) {
      var el = group.children[i];
      var cache = caches[i];
      TweenLite.to(el.position, cache.duration, { z: 0 });
    }
  };

  this.out = function (way) {
    var factor = way === 'up' ? 1 : -1;

    for (var i = 0, j = group.children.length; i < j; i++) {
      var el = group.children[i];
      var cache = caches[i];
      TweenLite.to(el.position, cache.duration, { z: factor * cache.z });
    }
  };

  this.start = function () {
    for (var i = 0, j = idleTweens.length; i < j; i++) {
      idleTweens[i].resume();
    }
  };

  this.stop = function () {
    for (var i = 0, j = idleTweens.length; i < j; i++) {
      idleTweens[i].pause();
    }
  };
}

Drop.defaultOptions = {
  count: 6,
  color: '#ffffff',
  amplitude: 2
};

/**
 * Get water ripple plane
 *
 * @method getPlane
 * @return {THREE.Mesh}
 */
Drop.prototype.getPlane = function () {
  var texture = THREE.ImageUtils.loadTexture('./app/public/img/texture-drop.png');
  
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    color: this.parameters.color,
    side: THREE.DoubleSide
  });

  var geometry = new THREE.PlaneGeometry(20, 20, 1, 1);

  return new THREE.Mesh(geometry, material);
};

/**
 * Get ripple animation
 *
 * @method getTween
 * @param {THREE.Mesh} [plane]
 * @param {Number} [index]
 * @return {TweenLite}
 */
Drop.prototype.getTween = function (plane, index) {
  var cache = { scale: 0.1, opacity: 1 };
  var scale = (index + 1) * (this.parameters.amplitude) / this.parameters.count;

  return TweenLite.to(cache, 1.5, { scale: scale, opacity: 0, paused: true, delay: (index * 100) / 1000,
      onUpdate: function () {
        plane.scale.x = plane.scale.y = cache.scale;
        plane.material.opacity = cache.opacity;
      },
      onComplete: loop
    });
};

module.exports = Drop;