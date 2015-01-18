'use strict';
  
var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var random = require('../utils/randomUtil');

/**
 * Animated strip
 *
 * @class Strip
 * @constructor
 * @param {Object} [options]
 * @pram {Number} [options.count=10] Strips count
 * @pram {Array} [options.colors=['#ffffff']] Strips colors
 * @pram {Number} [options.width=10] Strip width
 * @pram {Number} [options.height=3] Strip height
 * @pram {Number} [options.speed=1] Animations speed
 * @pram {Array} [options.rangeX=[-50, 50]] X position range
 * @pram {Array} [options.rangeY=[-50, 50]] Y position range
 * @pram {Array} [options.rangeZ=[-50, 50]] Z position range
 * @requires jQuery, THREE, TweenLite, random
 */
function Strip (options) {
  var parameters = jQuery.extend({
    count: 10,
    colors: ['#ffffff'],
    width: 10,
    height: 3,
    speed: 1,
    rangeX: [-50, 50],
    rangeY: [-50, 50],
    rangeZ: [-50, 50]
  }, options);

  var materials = {};

  var geometry = new THREE.PlaneGeometry(parameters.width, parameters.height);

  var group = new THREE.Object3D();

  for (var i = 0; i < parameters.count; i++) {
    var x = random(parameters.rangeX[0], parameters.rangeX[1]);
    var y = random(parameters.rangeY[0], parameters.rangeY[1]);
    var z = random(parameters.rangeZ[0], parameters.rangeZ[1]);

    var material;
    var color = parameters.colors[random(0, parameters.colors.length, true)];
    
    if (!materials[color]) {
      material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
      });

      materials[color] = material;
    }

    var mesh = new THREE.Mesh(geometry, materials[color]);
    mesh.position.set(x, y, z);
    group.add(mesh);
  }

  // cache values
  var from = geometry.vertices[0].x;
  var to = geometry.vertices[1].x;

  geometry.vertices[1].x = geometry.vertices[3].x = geometry.vertices[0].x;

  var cache = { x: from };

  function update () {
    geometry.vertices[1].x = geometry.vertices[3].x = this.target.x;

    geometry.verticesNeedUpdate = true;
    geometry.computeBoundingSphere();
  }

  this.el = group;

  this.in = function () {
    TweenLite.to(cache, parameters.speed, { x: to, onUpdate: update });
  };

  this.out = function () {
    TweenLite.to(cache, parameters.speed, { x: from, onUpdate: update });
  };
}

module.exports = Strip;