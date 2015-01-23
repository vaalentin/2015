'use strict';

var THREE = require('three');
var TweenLite = require('tweenlite');

var yoyo = require('../utils/yoyoUtil');

/**
 * 3D Rocks
 *
 * @class Rocks
 * @constructor
 * @requires THREE, TweenLite, yoyo
 */
function Rocks () {
  var group = new THREE.Object3D();

  var sphere = this.getSphere(); 
  group.add(sphere);

  var light = this.getLight();
  group.add(light);

  // rocks
  var rocksMaterial = new THREE.MeshLambertMaterial({
    color: '#0a0a0a',
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
  });

  var fromColor = new THREE.Color('#0a0a0a');
  var toColor = new THREE.Color('#ffffff');

  var loader = new THREE.JSONLoader();
  loader.load('./app/public/3D/rocks.js', function (geometry) {
    var rocks = new THREE.Mesh(geometry, rocksMaterial);
    rocks.position.set(-70, 0, -30);
    group.add(rocks);

    var cache = { angle: 0, y: 11, intensity: 0, color: 0 };
    function update () {
      rocks.rotation.x = cache.angle;

      light.intensity = cache.intensity;
      
      light.position.y = cache.y;
      sphere.position.y = cache.y;

      sphere.material.color = fromColor.clone().lerp(toColor, cache.color);
    }

    this.in = function () {
      TweenLite.to(cache, 1, { angle: 0.3, y: 20, intensity: 15, color: 1, onUpdate: update });
    };

    this.out = function (way) {
      var y = way === 'up' ? 11 : 20;
      TweenLite.to(cache, 1, { angle: 0, y: y, intensity: 0, color: 0, onUpdate: update });
    };

    var idleTween = TweenLite.to({ x: -2, z: -45 }, 2, { x: 2, z: -35, paused: true,
      onUpdate: function () {
        light.position.z = this.target.z;
        sphere.position.z = this.target.z;
      },
      onComplete: yoyo,
      onReverseComplete: yoyo
    });

    this.start = function () {
      idleTween.resume();
    };

    this.stop = function () {
      idleTween.pause();
    };

  }.bind(this));

  this.el = group;

  this.in = function () {};

  this.out = this.in;

  this.start = this.in;

  this.stop = this.in;
}

/**
 * Get white sphere
 *
 * @method getSphere
 * @return {THREE.Mesh}
 */
Rocks.prototype.getSphere = function () {
  var material = new THREE.MeshBasicMaterial({ color: '#0a0a0a', fog: false });
  var geometry = new THREE.SphereGeometry(5, 20, 20);
  var mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(0, 11, -40);

  return mesh;
};

/**
 * Get light
 *
 * @method getLight
 * @return {THREE.Light}
 */
Rocks.prototype.getLight = function () {
  var light = new THREE.PointLight('#ffffff', 0, 50);
  light.position.set(0, 11, -40);

  return light;
};

module.exports = Rocks;