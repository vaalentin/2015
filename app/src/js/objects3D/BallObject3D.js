'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');

var SOUNDS = require('../modules/soundsModule');
var random = require('../utils/randomUtil');
var yoyo = require('../utils/yoyoUtil');
var glitchMaterial = require('../materials/glitchMaterial');

/**
 * Animated ball
 *
 * @class Ball
 * @constructor
 * @requires THREE, TweenLite, SOUNDS, random, yoyo, glitchMaterial
 */
function Ball () {
  var texture = THREE.ImageUtils.loadTexture('./app/public/img/texture-ball.png');
  var textureAlpha = THREE.ImageUtils.loadTexture('./app/public/img/texture-ballAlpha.png');
  texture.wrapS = textureAlpha.wrapS = THREE.RepeatWrapping;
  texture.wrapT = textureAlpha.wrapT = THREE.RepeatWrapping;
  texture.repeat.x = textureAlpha.repeat.x = 0;
  texture.repeat.y = textureAlpha.repeat.y = 0;

  var materialStripe = new THREE.MeshLambertMaterial({
    map: texture,
    color: '#ffffff',
    emissive: '#0a0a0a',
    depthWrite: false,
    depthTest: true,
    transparent: true
  });

  var geometry = new THREE.SphereGeometry(10, 30, 30);

  var mesh = new THREE.Mesh(geometry, materialStripe);

  var colorA = new THREE.Color('#000000');
  var colorB = new THREE.Color('#ffffff');

  // Make the ball blink once
  function blink () {
    materialStripe.emissive = colorB;
    materialStripe.color = colorA;

    TweenLite.delayedCall(random(0.1, 1), function () {
      materialStripe.emissive = colorA;
      materialStripe.color = colorB;
    });
  }

  // Make the ball glitch once
  function glitch () {
    mesh.material = glitchMaterial;

    SOUNDS.whitenoise.play();

    TweenLite.delayedCall(random(0.2, 1), function () {
      mesh.material = materialStripe;
      SOUNDS.whitenoise.stop();
    });
  }
  
  var inTween = TweenLite.to({ y: 40, opacity: 0 }, 1.5, { y: 0, opacity: 1, paused: true,
    onUpdate: function () {
      mesh.position.y = this.target.y;
      materialStripe.opacity = this.target.opacity;  
    }
  });

  var appearTweenSteps = 6;
  var appearTweenCurrent = 0;
  var repeatValues = [1, 10, 30, 0, 1, 5];

  var appearTween = TweenLite.to({}, 0.1, { paused: true,
      onComplete: function () {
        appearTweenCurrent++;

        if (appearTweenCurrent < appearTweenSteps) {
          mesh.material.map = textureAlpha;
          textureAlpha.repeat.set(1, repeatValues[appearTweenCurrent]);

          this.duration(0.2);
          this.restart();
        } else {
          mesh.material.map = texture;
          appearTweenCurrent = 0;
        }
      }
    });

  var rotateY = 0;
  var rotateX = 0;

  var idleTweens = {
    rotate: TweenLite.to({ textureRepeat: 3 }, 5, { textureRepeat: 8, paused: true,
        onUpdate: function () {
          texture.repeat.set(1, this.target.textureRepeat);

          mesh.rotation.y = rotateY;
          mesh.rotation.x = rotateX;

          rotateY += 0.01;
          rotateX += 0.02;
        },
        onComplete: yoyo,
        onReverseComplete: yoyo
      }),

    glitch: TweenLite.to({}, random(0.1, 5), { paused: true,
        onComplete: function () {
          glitch();
          this.duration(random(0.1, 5));
          this.restart();
        }
      }),

    blink: TweenLite.to({}, random(0.1, 5), { paused: true,
        onComplete: function () {
          blink();
          this.duration(random(0.1, 5));
          this.restart();
        }
      })
  };

  this.el = mesh;

  this.in = function () {
    inTween.play();
    appearTween.restart();
  };

  this.out = function () {
    inTween.reverse();
  };

  this.start = function () {
    idleTweens.rotate.resume();
    // idleTweens.glitch.resume();
    idleTweens.blink.resume();
  };

  this.stop = function () {
    idleTweens.rotate.pause();
    // idleTweens.glitch.pause();
    idleTweens.blink.pause();
  };
}

module.exports = Ball;