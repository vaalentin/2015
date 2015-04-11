/* jshint laxbreak: true */

'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var random = require('../utils/randomUtil');
var map = require('../utils/mapUtil');
var loop = require('../utils/loopUtil');

/**
 * @class Galaxy
 * @constructor
 * @param {Object} [options]
 * @param {String} [ringFromColor='#ffffff'] Off color
 * @param {String} [ringToColor='#333333'] On color
 * @param {Number} [ringDivisions=100] Rings divisions
 * @param {Number} [ringColorSteps=30] Gradient steps
 * @requires jQuery, THREE, TweenLite, random, map, loop
 */
function Galaxy (options) {
  this.parameters = jQuery.extend(Galaxy.defaultOptions, options);

  var group = new THREE.Object3D();

  var ring = this.getRing();
  var planet = this.getPlanet();

  var greyPlanet = planet.clone();
  greyPlanet.material = greyPlanet.material.clone();
  greyPlanet.material.color = new THREE.Color('#4c4c4c');

  var blackPlanet = planet.clone();
  blackPlanet.material = blackPlanet.material.clone();
  blackPlanet.material.color = new THREE.Color('#000000');

  var radius = [8, 10, 16, 25, 31];
  var planets = {
    8: { el: planet.clone(), scale: 0.2, increment: 0.03 },
    10: { el: greyPlanet.clone(), scale: 0.1, increment: 0.03 },
    16: { el: greyPlanet.clone(), scale: 0.5, increment: 0.02 },
    25: { el: planet.clone(), scale: 0.7 },
    31: { el: blackPlanet.clone(), scale: 0.5, increment: 0.05 }
  };

  for (var i = 0, j = radius.length; i < j; i++) {
    var ringRadius = radius[i];

    var ringCopy = ring.clone();
    ringCopy.scale.x = ringCopy.scale.y = ringRadius;
    ringCopy.rotation.z = random(0, Math.PI);

    group.add(ringCopy);

    if (planets[ringRadius]) {
      var planetCopy = planets[ringRadius].el;
      var scale = planets[ringRadius].scale;

      planetCopy.scale.x = planetCopy.scale.y = planetCopy.scale.z = scale;

      // random start theta
      var theta = random(0, 2 * Math.PI);
      var x = ringRadius * Math.cos(theta);
      var y = ringRadius * Math.sin(theta);
      planets[ringRadius].theta = theta;
      planetCopy.position.set(x, y, 0);

      group.add(planetCopy);
    }
  }

  var cache = { rotationX: 0, rotationY: 0 };

  function update () {
    group.rotation.y = cache.rotationY;
    group.rotation.x = cache.rotationX;
  }

  this.el = group;

  this.in = function (way) {
    cache = way === 'up'
      ? { rotationY: -0.6, rotationX: -0.5 }
      : { rotationY: 0.6, rotationX: -1.5 };

    update();

    TweenLite.to(cache, 2, { rotationX: -1, rotationY: 0.2, onUpdate: update });
  };

  this.out = function (way) {
    var to = way === 'up'
      ? { rotationY: 0.6, rotationX: -1.5, onUpdate: update }
      : { rotationY: -0.6, rotationX: -0.5, onUpdate: update };
  
    TweenLite.to(cache, 1, to);
  };

  var idleTween = TweenLite.to({}, 10, { paused: true,
      onUpdate: function () {
        for (var radius in planets) {
          if (planets.hasOwnProperty(radius)) {
            var el = planets[radius].el;
            var theta = planets[radius].theta;
            var increment = planets[radius].increment || 0.01;

            var x = radius * Math.cos(theta);
            var y = radius * Math.sin(theta);

            planets[radius].theta -= increment;

            el.position.x = x;
            el.position.y = y;
          }
        }

        ring.geometry.colors = ring.geometry.colors.concat(ring.geometry.colors.splice(0, 1));
        ring.geometry.colorsNeedUpdate = true;
      },
      onComplete: loop
    });

  this.start = function () {
    idleTween.resume();
  };

  this.stop = function () {
    idleTween.pause();
  };
}

Galaxy.defaultOptions = {
  ringFromColor: '#ffffff',
  ringToColor: '#333333',
  ringDivisions: 100,
  ringColorSteps: 30
};

/**
 * Get base planet
 *
 * @method getPlanet
 * @return {THREE.Mesh}
 */
Galaxy.prototype.getPlanet = function () {
  var planetMaterial = new THREE.MeshBasicMaterial();
  var planetGeometry = new THREE.SphereGeometry(5, 20, 20);
  var planet = new THREE.Mesh(planetGeometry, planetMaterial);

  return planet;
};

/**
 * Get base ring
 *
 * @method getRing
 * @return {THREE.Line}
 */
Galaxy.prototype.getRing = function () {
  var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

  var geometry = new THREE.Geometry();

  var step = 2 * Math.PI / this.parameters.ringDivisions;

  for (var i = 0; i < this.parameters.ringDivisions + 1; i++) {
    var theta = i * step;

    var vertex = new THREE.Vector3(1 * Math.cos(theta), 1 * Math.sin(theta), 0);

    geometry.vertices.push(vertex);
  }

  var fromColor = new THREE.Color(this.parameters.ringFromColor);
  var toColor = new THREE.Color(this.parameters.ringToColor);

  var colors = [];

  for (var j = 0; j < this.parameters.ringColorSteps; j++) {
    var percent = map(j + 1, [0, this.parameters.ringColorSteps], [0, 1]);
    colors[j] = fromColor.clone().lerp(toColor, percent);
  }

  var total = geometry.vertices.length;
  var start = 0;
  var current = start;

  var verticesColors = [];

  for (var k = 0; k < total; k++) {
    current++;

    if (current > total) {
      current = 0;
    }

    var vertexColor = colors[current] ? colors[current] : toColor;

    verticesColors.push(vertexColor);
  }

  geometry.colors = verticesColors;

  var ring = new THREE.Line(geometry, material);

  return ring;
};

module.exports = Galaxy;