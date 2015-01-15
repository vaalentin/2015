'use strict';

// vendor
var jQuery = require('jquery');
var THREE = require('three');
var TWEEN = require('tween');

function ParticlesSphere (options) {
  // private
  this.parameters = jQuery.extend({
    numberParticles: 100,
    amplitude: 10,
    speed: 2000
  }, options);

  this.center = null;

  // public
  this.el = null;
  this.animations = null;

  this.init();
}

ParticlesSphere.prototype.init = function () {
  this.center = new THREE.Vector3(0, 0, 0);

  var material = new THREE.PointCloudMaterial({
    color: '#ffffff',
    size: 0.5,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending
  });

  var particles = new THREE.Geometry();
  var normals = [];

  for (var i = 0; i < this.parameters.numberParticles; i++) {
    var particle = this.getRandomPointOnSphere();
    particles.vertices.push(particle);

    var normal = particle.clone().sub(this.center);
    normals.push(normal);
  }

  var cloud = new THREE.PointCloud(particles, material);

  var _this = this;

  var tween = new TWEEN.Tween({
      amp: this.parameters.amplitude / 2,
      opacity: 0.2
    })
    .to({
      amp: this.parameters.amplitude,
      opacity: 1
    }, this.parameters.speed)
    .delay(1000)
    .easing(TWEEN.Easing.Elastic.Out)
    .repeat(Infinity)
    .yoyo(true)
    .onUpdate(function () {
      // update particles
      for (var i = 0, j = particles.vertices.length; i < j; i++) {
        var normal = normals[i];
        var newPosition = normal.clone().multiplyScalar(this.amp);
        particles.vertices[i] = newPosition;
      }
      particles.verticesNeedUpdate = true;

      // update material
      material.opacity = this.opacity;
    })
    .onStop(function () {
      this.amp = _this.parameters.amplitude / 2;
      this.opacity = 0.2;
      tween.to({ amp: _this.parameters.amplitude, opacity: 1 });
    });

  this.el = cloud;
  this.animations = {
    idle: tween
  };
};

ParticlesSphere.prototype.getRandomPointOnSphere = function () {
  var u = Math.random();
  var v = Math.random();
  var theta = 2 * Math.PI * u;
  var phi = Math.acos(2 * v - 1);
  var x = this.center.x + (2 * Math.sin(phi) * Math.cos(theta));
  var y = this.center.y + (2 * Math.sin(phi) * Math.sin(theta));
  var z = this.center.z + (2 * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
};

module.exports = ParticlesSphere;