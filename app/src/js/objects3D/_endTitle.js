'use strict';

var THREE = require('three');
var TWEEN = require('tween');

function  Title () {
  this.el = null;
  this.animations = null;

  this.init();
}

Title.prototype.init = function () {
  var texture = new THREE.ImageUtils.loadTexture('../app/public/img/part-end.png');
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    depthWrite: false,
    depthTest: true,
    transparent: true
  });

  var geometry = new THREE.PlaneGeometry(30, 20);
  var plane = new THREE.Mesh(geometry, material);

  // animations
  var cache = { y: 20, opacity: 0 };

  var inTween = new TWEEN.Tween(cache)
    .to({ y: 0, opacity: 1 })
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onStart(function () {
      outTween.stop();
    })
    .onUpdate(function () {
      plane.position.y = this.y;
      material.opacity = this.opacity;
    });

  var outTween = new TWEEN.Tween(cache)
    .to({ y: 20, opacity: 0 })
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onStart(function () {
      inTween.stop();
    })
    .onUpdate(function () {
      plane.position.y = this.y;
      material.opacity = this.opacity;
    });

  // exports
  this.el = plane;
  this.animations = {
    in: inTween,
    out: outTween
  };
};

module.exports = Title;