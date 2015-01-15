'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite')

var SOUNDS = require('../modules/soundsModule');
var random = require('../utils/randomUtil');
var yoyo = require('../utils/yoyoUtil');

/**
 * Animated Neon
 *
 * @class Neon
 * @constructor
 * @params {Object} [options]
 * @params {String} [options.color='#ffffff'] Neon's color
 * @params {Number} [options.width=20] Neon's width
 * @params {Boolean} [options.projection=true] Projection halo?
 * @params {Boolean} [options.flicker=true] Flicker?
 * @requires jQuery, THREE, TWEEN, random
 */
function Neon (options) {
  this.parameters = jQuery.extend({
    color: '#ffffff',
    width: 20,
    projection: true,
    planes: 3
  }, options);

  var group = new THREE.Object3D();

  var tube = this.getTube();
  group.add(tube);

  var glow = this.getGlow();
  var glows = this.getGlows(glow);
  group.add(glows);

  if (this.parameters.projection) {
    var projection = this.getProjection();
    group.add(projection);
  }

  // animations
  var _this = this;

  var currentFlicker = 0;
  var totalFlicker = random(3, 6, true);
  var flickering = false;

  /**
   * Flick once from off to on
   *
   * @method flickOn
   */
  function flickOn () {
    tube.material.emissive.set(_this.parameters.color);
    tube.material.needsUpdate = true;

    glow.material.opacity = 0.3;

    if (_this.parameters.projection) {
      projection.material.opacity = 0.05;
    }

    SOUNDS.neon.play();

    TweenLite.delayedCall(random(0.05, 0.07), function () {
      tube.material.emissive.set('#000000');
      tube.material.needsUpdate = true;

      glow.material.opacity = 0;

      if (_this.parameters.projection) {
        projection.material.opacity = 0;
      }
    });
  }

  /**
   * Flick once from on to off
   *
   * @method flickOff
   */
  function flickOff () {
    flickering = !flickering;
    
    glow.material.opacity = 0;

    if (_this.parameters.projection) {
      projection.material.opacity = 0.05;
    }

    TweenLite.delayedCall(random(0.05, 0.1), function () {
      flickering = !flickering;

      SOUNDS.neon.play();
    });
  }

  var idleTweens = {
    intensity: TweenLite.to({ projection: 0.08, glow: 0.4 }, random(0.8, 5), { projection: 0.15, glow: 0.7, paused: true,
        onStart: function () {
          tube.material.emissive.set(_this.parameters.color);
        },
        onUpdate: function () {
          if (!flickering) {
            glow.material.opacity = this.target.glow;
            if (_this.parameters.projection) {
              projection.material.opacity = this.target.projection;
            }
          }
        },
        onComplete: yoyo,
        onReverseComplete: yoyo
      }),

    flick: TweenLite.to({}, random(0.1, 10), { paused: true,
        onComplete: function () {
          flickOff();
          this.duration(random(0.1, 10));
          this.restart();
        }
      })
  };

  var inTween = TweenLite.to({}, random(0.2, 2), { paused: true,
      onComplete: function () {
        if (currentFlicker++ < totalFlicker) {
          flickOn();
          this.duration(random(0.1, 0.5));
          this.restart();
        } else {
          animations = [idleTweens.intensity, idleTweens.flick];
          _this.start();
        }
      }
    });

  var animations = [inTween];

  this.el = group;
  
  this.start = function () {
    for (var i = 0, j = animations.length; i < j; i++) {
      animations[i].resume();
    }
  };

  this.stop = function () {
    for (var i = 0, j = animations.length; i < j; i++) {
      animations[i].pause();
    }
  };
}

Neon.prototype.getTube = function () {
  var geometry = new THREE.CylinderGeometry(0.2, 0.2, this.parameters.width, 6);
  var material = new THREE.MeshLambertMaterial({
    color: '#808080',
    emissive: '#000000'
  });
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
};

Neon.prototype.getGlow = function () {
  var texture = new THREE.ImageUtils.loadTexture('../app/public/img/texture-neonGlow.png');
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

Neon.prototype.getGlows = function (glow) {
  var glows = new THREE.Object3D();

  for (var i = 0; i < this.parameters.planes; i++) {
    var copy = glow.clone();
    copy.rotation.y = i * (0.7 * Math.PI);
    glows.add(copy);
  }

  return glows;
};

Neon.prototype.getProjection = function () {
  var texture = THREE.ImageUtils.loadTexture('../app/public/img/texture-neonProjection.png');
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