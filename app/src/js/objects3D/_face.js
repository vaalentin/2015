'use strict';

var THREE = require('three');
var TWEEN = require('tween');

var Animation = require('../classes/animation');

var random = require('../utils/randomUtil');

function Face () {
  this.el = null;
  this.animation = null;

  this.init();
}

Face.prototype.init = function () {
  var group = new THREE.Object3D();

  //light
  var light = new THREE.PointLight('#ffffff', 10, 50);
  light.position.set(-30, 0, -10);
  group.add(light);

  // materials
  var material = new THREE.MeshLambertMaterial({
    color: '#333333',
    morphTargets: true
  });

  var wireframeMaterial = new THREE.MeshBasicMaterial({
    morphTargets: true,
    wireframe: true,
    color: '#7f7f7f'
  });

  // map morphs
  var morphs = {
    eyebrows: 0,
    surprise: 1,
    blink: 2,
    happy: 3,
    angry: 4,
    look: 5,
  };

  // blank animation
  // the final animations are setup asynchronously
  var blankTween = new TWEEN.Tween(null).to(null, 0);

  // exports
  this.el = group;
  this.animations = {
    in: blankTween,
    out: blankTween,
    idle: blankTween
  };

  var _this = this;

  var loader = new THREE.JSONLoader();
  loader.load('../app/public/3D/face.js', function (geometry) {
        
    var face = new THREE.Mesh(geometry, material);
    face.rotation.set(0, 0.2, 0.2);
    face.scale.set(18, 18, 18);
    _this.el.add(face);

    function flick () {
      face.material = material;

      setTimeout(function () {
        face.material = wireframeMaterial;
      }, random(50, 100));
    }

    // animations
    var steps = 0;
    var totalSteps = 3;

    // in
    _this.animations.in = new TWEEN.Tween(null)
      .to(null, 0)
      .delay(0)
      .onComplete(function () {
        steps++;

        if (steps === totalSteps) {
          steps = 0;
          face.material = material;
        } else {
          flick();
          _this.animations.in.delay(steps * random(110, 200));
          _this.animations.in.start();
        }        
      })
      .onStop(function () {
        steps = 0;
      });

    // out
    _this.animations.out = _this.animations.in;

    // idle
    var idleTweens = {
      blink: new TWEEN.Tween({ i: 0 })
        .to({ i: [1, 0] }, 800)
        .delay(random(0, 5000))
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
          face.morphTargetInfluences[morphs.blink] = this.i;
        })
        .onComplete(function () {
          idleTweens.blink.delay(random(800, 5000));
          idleTweens.blink.start();
        }),

      eyebrows: new TWEEN.Tween({ i: 0 })
        .to({ i: 0.5 }, random(500, 4000))
        .repeat(1)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
          face.morphTargetInfluences[morphs.eyebrows] = this.i;
        })
        .onComplete(function () {
          idleTweens.eyebrows.to({ i: random(0, 1) }, random(500, 4000));
          idleTweens.eyebrows.start();
        }),

      happy: new TWEEN.Tween({ i: 0 })
        .to({ i: 0.3 }, random(500, 2000))
        .repeat(1)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
          face.morphTargetInfluences[morphs.happy] = this.i;
        })
        .onComplete(function () {
          idleTweens.happy.to({ i: random(0.2, 0.6) }, random(500, 2000));
          idleTweens.happy.start();
        }),

      look: new TWEEN.Tween({ i: 0 })
        .to({ i: 0.5 }, random(500, 3000))
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
          face.morphTargetInfluences[morphs.look] = this.i;
        })
        .onComplete(function () {
          idleTweens.look.to({ i: random(0, 0.5) }, random(500, 3000));
          idleTweens.look.start();
        })
    };

    // _this.animations.idle = new Animation([
    //   idleTweens.blink,
    //   idleTweens.eyebrows,
    //   idleTweens.happy,
    //   idleTweens.look
    // ]);

    //
    function getRandomValues () {
      return {
        eyebrows: random(0, 1),
        happy: random(0.1, 0.6),
        look: random(0, 0.5)
      };
    }

    var fullIdleTween = new TWEEN.Tween(getRandomValues())
      .to(getRandomValues(), random(500, 2000))
      .onUpdate(function () {
        face.morphTargetInfluences[morphs.eyebrows] = this.eyebrows;
        face.morphTargetInfluences[morphs.happy] = this.happy;
        face.morphTargetInfluences[morphs.look] = this.look;
      })
      .onComplete(function () {
        fullIdleTween.to(getRandomValues(), random(500, 2000));
        fullIdleTween.start();
      });

    _this.animations.idle = new Animation([
      idleTweens.blink,
      fullIdleTween
    ]);
    //

  });

};

module.exports = Face;