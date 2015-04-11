'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var random = require('../utils/randomUtil');
var yoyo = require('../utils/yoyoUtil');

/**
 * Light beam
 *
 * @class Beam
 * @constructor
 * @param {Object} [options]
 * @param {String} [options.color='#ffffff'] Beam color
 * @param {Number} [options.height=15] Beam expanded height
 * @param {Number} [options.width=2] Beam width
 * @param {Number} [options.cubeSize=0.5] Extremity cube size
 * @param {Number} [options.delay=0] Animations delay
 * @requires jQuery, THREE, TweenLite, random, yoyo
 */
function Beam (options) {
  var parameters = jQuery.extend(Beam.defaultOptions, options);

  var width = parameters.width;
  var height = parameters.height;

  var group = new THREE.Object3D();

  var baseMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    color: parameters.color
  });

  var bodyTexture = THREE.ImageUtils.loadTexture('./app/public/img/texture-laserBody.png');
  var capTexture = THREE.ImageUtils.loadTexture('./app/public/img/texture-laserCap.png');
  var flareTexture = THREE.ImageUtils.loadTexture('./app/public/img/texture-laserFlare.png');

  var lineMaterial = new THREE.LineBasicMaterial({ color: parameters.color });
  var bodyMaterial = baseMaterial.clone();
  var capMaterial = baseMaterial.clone();
  var flareMaterial = baseMaterial.clone();
  var cubeMaterial = baseMaterial.clone();

  bodyMaterial.map = bodyTexture;
  capMaterial.map = capTexture;
  flareMaterial.map = flareTexture;

  var bodyGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
  var capGeometry = new THREE.PlaneGeometry(width, width, 1, 1);
  var flareGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);
  var movingFlareGeometry = new THREE.PlaneGeometry(10, 40);
  var cubeGeometry = new THREE.BoxGeometry(
    parameters.cubeSize,
    parameters.cubeSize,
    parameters.cubeSize
  );

  // set height 0
  bodyGeometry.vertices[2].y = bodyGeometry.vertices[3].y = (height / 2) + (width / 2);
  bodyGeometry.verticesNeedUpdate = true;
  bodyGeometry.computeBoundingSphere();

  var bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  var capMeshTop = new THREE.Mesh(capGeometry, capMaterial);
  var capMeshBottom = capMeshTop.clone();
  var flareMesh = new THREE.Mesh(flareGeometry, flareMaterial);
  var cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

  bodyMesh.position.y = 0;
  capMeshTop.position.y = (height / 2) + (width / 2);
  capMeshBottom.position.y = -(height / 2) - (width / 2);
  capMeshBottom.rotation.z = Math.PI;
  flareMesh.position.y = -(height / 2) - (width / 2);

  // line
  var lineGeometry = new THREE.Geometry();
  lineGeometry.vertices.push(new THREE.Vector3(0, (height / 2) + (width / 2), 0));
  lineGeometry.vertices.push(new THREE.Vector3(0, (height / 2) + (width / 2), 0));

  var lineMesh = new THREE.Line(lineGeometry, lineMaterial);

  group.add(lineMesh);

  // body 
  var body = new THREE.Object3D();

  var bodyPlane = new THREE.Object3D();

  bodyPlane.add(bodyMesh);
  bodyPlane.add(capMeshTop);
  bodyPlane.add(capMeshBottom);

  body.add(bodyPlane);

  group.add(body);

  // flare
  group.add(flareMesh);

  // moving flare
  var movingFlareMaterial = flareMaterial.clone();
  var movingFlareMesh = new THREE.Mesh(movingFlareGeometry, movingFlareMaterial);
  movingFlareMesh.scale.x = 3;
  group.add(movingFlareMesh);

  // cube group
  var cubeGroup = new THREE.Object3D();
  cubeGroup.add(cubeMesh);
  cubeGroup.add(movingFlareMesh);
  group.add(cubeGroup);

  // animations
  var cache = { y: (height / 2) + (width / 2) };

  function positionUpdate () {
    /*jshint validthis: true */
    
    var extremity = this.target.y - (width /2);

    lineGeometry.vertices[1].y = extremity;
    lineGeometry.verticesNeedUpdate = true;
    lineGeometry.computeBoundingSphere();

    bodyGeometry.vertices[2].y = bodyGeometry.vertices[3].y = this.target.y;
    bodyGeometry.verticesNeedUpdate = true;
    bodyGeometry.computeBoundingSphere();

    capMeshBottom.position.y = extremity;

    flareMesh.position.y = extremity;
    cubeGroup.position.y = extremity;
  }

  var idleTweens = {
    flare: TweenLite.to({ scale: 1, opacity: 1 }, random(1, 2), { scale: 2, opacity: 0.6, paused: true,
        onUpdate: function () {
          flareMesh.scale.set(this.target.scale, this.target.scale, 1);
          flareMaterial.opacity = this.target.opacity;
        },
        onComplete: yoyo,
        onReverseComplete: yoyo
      }),

    movingflare: TweenLite.to({ y: 0, scale: 3, opacity: 1 }, random(2, 6), { y: 30, scale: 1, opacity: 0, paused: true,
        onUpdate: function () {
          movingFlareMesh.position.y = this.target.y;
          movingFlareMesh.scale.x = this.target.scale;
          movingFlareMaterial.opacity = this.target.opacity;
        },
        onComplete: yoyo,
        onReverseComplete: yoyo
      }),

    body: TweenLite.to({ opacity: 1 }, random(1, 2), { opacity: 0.5,
        onUpdate: function () {
          bodyMaterial.opacity = capMaterial.opacity = this.target.opacity;
        },
        onComplete: yoyo,
        onReverseComplete: yoyo
      })
  };

  this.el = group;

  var delay = parameters.delay;

  this.in = function () {
    TweenLite.to(cache, 1, { y: -5, delay: delay, onUpdate: positionUpdate });
  };

  this.out = function (way) {
    var y = way === 'up' ? ((height / 2) + (width / 2)) - 1 : -70;
    TweenLite.to(cache, 1, { y: y, delay: delay, onUpdate: positionUpdate });
  };

  this.start = function () {
    idleTweens.flare.resume();
    idleTweens.movingflare.resume();
    idleTweens.body.resume();
  };

  this.stop = function () {
    idleTweens.flare.pause();
    idleTweens.movingflare.pause();
    idleTweens.body.pause();
  };
}

Beam.defaultOptions = {
  color: '#ffffff',
    height: 15,
    width: 2,
    cubeSize: 0.5,
    delay: 0
  };

module.exports = Beam;