'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var SOUNDS = require('../modules/soundsModule');
var random = require('../utils/randomUtil');
var yoyo = require('../utils/yoyoUtil');

/**
 * Animated Neon
 *
 * @class Neon
 * @constructor
 * @params {Object} [options]
 * @params {String} [options.color='#ffffff'] Neon color
 * @params {Number} [options.width=20] Neon width
 * @params {Boolean} [options.projection=true] Projection halo?
 * @params {Boolean} [options.planes=3] Glow planes
 * @requires jQuery, THREE, TweenLite, SOUNDS, random, yoyo
 */
function Neon (options) {
  this.parameters = jQuery.extend(Neon.defaultOptions, options);

  this.el = new THREE.Object3D();

  // setup 3d els
  this.tube = this.getTube();
  this.glow = this.getGlow();

  var glows = this.getGlows(this.glow);

  this.el.add(this.tube);
  this.el.add(glows);

  if (this.parameters.projection) {
    this.projection = this.getProjection();
    this.el.add(this.projection);
  }

  // flicker
  this.currentFlicker = 0;
  this.totalFlicker = random(3, 6, true);
  this.flickering = false;

  // animations
  var _this = this;

  this.idleIntensityTween = TweenLite.to({ projection: 0.08, glow: 0.4 }, random(0.8, 5), {
    projection: 0.15, glow: 0.7, paused: true,
    onStart: function () {
      _this.tube.material.emissive.set(_this.parameters.color);
    },
    onUpdate: function () {
      if (_this.flickering) {
        return false;
      }

      _this.glow.material.opacity = this.target.glow;
      if (_this.parameters.projection) {
        _this.projection.opacity = this.target.opacity;
      }
    },
    onComplete: yoyo,
    onReverseComplete: yoyo
  });

  this.idleFlickTween = TweenLite.to({}, random(0.1, 10), { paused: true,
    onComplete: function () {
      _this.flickOff();
      this.duration(random(0.1, 10));
      this.restart();
    }
  });

  this.inTween = TweenLite.to({}, random(0.2, 2), { paused: true,
    onComplete: function () {
      if (_this.currentFlicker++ < _this.totalFlicker) {
        _this.flickOn();
        this.duration(random(0.1, 0.5));
        this.restart();
      }
      else {
        _this.animations = [_this.idleIntensityTween, _this.idleFlickTween];
        _this.start();
      }
    }
  });

  this.animations = [this.inTween];
};

Neon.defaultOptions = {
  color: '#ffffff',
  width: 20,
  projection: true,
  planes: 3
};

/**
 * Start animations sequence
 */
Neon.prototype.start = function () {
  for (var i = 0, j = this.animations.length; i < j; i++) {
    this.animations[i].resume();
  }
};

/**
 * Stop animations sequence
 */
Neon.prototype.stop = function () {
  for (var i = 0, j = this.animations.length; i < j; i++) {
    this.animations[i].pause();
  }
};

/**
 * Flick on once
 * from off to on
 */
Neon.prototype.flickOn = function () {
  this.tube.material.emissive.set(this.parameters.color);
  this.tube.material.needsUpdate = true;

  this.glow.material.opacity = 0.3;

  if (this.parameters.projection) {
    this.projection.material.opacity = 0.05;
  }

  SOUNDS.neon.play();

  var _this = this;

  TweenLite.delayedCall(random(0.05, 0.07), function () {
    _this.tube.material.emissive.set('#000000');
    _this.tube.material.needsUpdate = true;

    _this.glow.material.opacity = 0;

    if (_this.parameters.projection) {
      _this.projection.material.opacity = 0;
    }
  });
};

/**
 * Flick off once
 * from on to off
 */
Neon.prototype.flickOff = function () {
  this.flickering = !this.flickering;
  
  this.glow.material.opacity = 0;

  if (this.parameters.projection) {
    this.projection.material.opacity = 0.05;
  }

  var _this = this;

  TweenLite.delayedCall(random(0.05, 0.1), function () {
    _this.flickering = !_this.flickering;

    SOUNDS.neon.play();
  });
};

/**
 * Get neon tube
 *
 * @method getTube
 * @return {THREE.Mesh}
 */
Neon.prototype.getTube = function () {
  var geometry = new THREE.CylinderGeometry(0.2, 0.2, this.parameters.width, 6);
  var material = new THREE.MeshLambertMaterial({
    color: '#808080',
    emissive: '#000000'
  });
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
};

/**
 * Get neon single glow
 *
 * @method getGlow
 * @return {THREE.Mesh}
 */
Neon.prototype.getGlow = function () {
  var texture = new THREE.ImageUtils.loadTexture('./app/public/img/texture-neonGlow.png');
  var material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    map: texture,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    color: this.parameters.color,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });

  var geometry = new THREE.PlaneGeometry(5, this.parameters.width + 3);
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
};

/**
 * Get neon glows
 *
 * @method getGlows
 * @param {THREE.Mesh} [glow]
 * @return {THREE.Object3D}
 */
Neon.prototype.getGlows = function (glow) {
  var glows = new THREE.Object3D();

  for (var i = 0; i < this.parameters.planes; i++) {
    var copy = glow.clone();
    copy.rotation.y = i * (0.7 * Math.PI);
    glows.add(copy);
  }

  return glows;
};

/**
 * Get neon projection
 *
 * @method getProjection
 * @return {THREE.Mesh}
 */
Neon.prototype.getProjection = function () {
  var texture = THREE.ImageUtils.loadTexture('./app/public/img/texture-neonProjection.png');
  var material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    map: texture,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    color: this.parameters.color,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });

  var geometry = new THREE.PlaneGeometry(this.parameters.width * 2, 50);
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -1;

  return mesh;
};

module.exports = Neon;