'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var map = require('../utils/mapUtil');
var random = require('../utils/randomUtil');

/**
 * Simple 3D grid that can receive forces
 *
 * @class Grid
 * @constructor
 * @param {Object} [options]
 * @param {Number} [options.stepsX=10] x steps
 * @param {Number} [options.stepsY=10] y steps
 * @param {Number} [options.stepSize=2] Step's size,
 * @param {String} [options.linesFromColor='#ffffff'] Height min color
 * @param {String} [options.linesToColor='#333333'] Height max color
 * @requires jQuery, THREE
 */
function Grid (options) {
  this.parameters = jQuery.extend(Grid.defaultOptions, options);

  this.lines = null;
  this.points = null;
  this.colorsCache = {}; // cache vertices colors

  this.el = null;

  this.init();
  this.render();
}

Grid.defaultOptions = {
  stepsX: 10,
  stepsY: 10,
  stepSize: 2,
  linesFromColor: '#ffffff',
  linesToColor: '#333333',
  points: false
};

/**
 * Initialize
 *
 * @method init
 */
Grid.prototype.init = function () {
  var width = (this.parameters.stepsX - 1) * this.parameters.stepSize;
  var height = (this.parameters.stepsY - 1) * this.parameters.stepSize;

  var points = new THREE.Geometry();

  for (var x = 0; x < this.parameters.stepsX; x++) {
    for (var y = 0; y < this.parameters.stepsY; y++) {
      var xPos = (x * this.parameters.stepSize) - (width / 2);
      var yPos = (y * this.parameters.stepSize) - (height / 2);
      var zPos = 0;

      var vertex = new THREE.Vector3(xPos, yPos, zPos);
      points.vertices.push(vertex);
    }
  }

  // init color cache
  var fromColor = new THREE.Color(this.parameters.linesFromColor);
  var toColor = new THREE.Color(this.parameters.linesToColor);

  for (var i = 0; i <= 1; i += 0.1) {
    var percent = Math.round(i * 10) / 10;
    this.colorsCache[percent] = fromColor.clone().lerp(toColor, percent);
  }

  this.points = points;
};

/**
 * Render the points and lines
 *
 * @method render
 */
Grid.prototype.render = function () {
  var group = new THREE.Object3D();

  // points
  var pointCloudMaterial = new THREE.PointCloudMaterial({
    size: 0.3
  });
  var pointCloud = new THREE.PointCloud(this.points, pointCloudMaterial);

  if (this.parameters.points) {
    group.add(pointCloud);
  }

  // lines
  var lines = new THREE.Object3D();

  var lineMaterial = new THREE.LineBasicMaterial({
    color: this.parameters.linesColor,
    vertexColors: THREE.VertexColors
  });

  // horizontal
  for (var i = 0; i < this.parameters.stepsY; i++) {
    var hLineGeometry = new THREE.Geometry();

    for (var j = 0; j < this.parameters.stepsX; j++) {
      hLineGeometry.vertices.push(
        this.points.vertices[i + (j * this.parameters.stepsY)]
      );
    }

    var hLine = new THREE.Line(hLineGeometry, lineMaterial);

    lines.add(hLine);
  }

  // vertical
  for (var k = 0; k < this.parameters.stepsX; k++) {
    var vLineGeometry = new THREE.Geometry();

    for (var l = 0; l < this.parameters.stepsY; l++) {
      vLineGeometry.vertices.push(
        this.points.vertices[(k * this.parameters.stepsY) + l]
      );        
    }

    var vLine = new THREE.Line(vLineGeometry, lineMaterial);

    lines.add(vLine);
  }

  group.add(lines);

  // exports
  this.points = pointCloud;
  this.lines = lines;
  this.el = group;
};

/**
 * Apply a force onto the grid
 *
 * @method applyForce
 * @param {THREE.Vector3} [center] Where to apply the force
 * @param {Number} [strength] Strength of the force
 */
Grid.prototype.applyForce = function (center, strength) {
  // update points
  for (var i = 0, j = this.points.geometry.vertices.length; i < j; i++) {
    var dist = this.points.geometry.vertices[i].distanceTo(center);

    this.points.geometry.vertices[i].z -= (strength * 10) / Math.sqrt(dist * 2 ) - (strength * 2);
  }
  this.points.geometry.verticesNeedUpdate = true;

  // update lines
  for (var k = 0, l = this.lines.children.length; k < l; k++) {
    var geometry = this.lines.children[k].geometry;

    // update vertices colors
    for (var m = 0, n = geometry.vertices.length; m < n; m++) {
      var vertex = geometry.vertices[m];
      var percent = map(vertex.z, [0, 5], [0, 1]);
      percent = Math.round(percent * 10) / 10;

      geometry.colors[m] = this.colorsCache[percent];
    }

    geometry.verticesNeedUpdate = true;
    geometry.colorsNeedUpdate = true;
  }
};

/**
 * Reset all the forces applied
 *
 * @method resetFroce
 */
Grid.prototype.resetForce = function () {
  for (var i = 0, j = this.points.geometry.vertices.length; i < j; i++) {
    this.points.geometry.vertices[i].z = 0;
  }
};

/**
 * Get grid total size
 *
 * @method getSize
 * @return {Object}
 */
Grid.prototype.getSize = function () {
  var width = (this.parameters.stepsX - 1) * this.parameters.stepSize;
  var height = (this.parameters.stepsY - 1) * this.parameters.stepSize;

  return {
    x: {
      min: -(width / 2),
      max: (this.parameters.stepsX * this.parameters.stepSize) - (width / 2)
    },
    y: {
      min: -(height / 2),
      max: (this.parameters.stepsY * this.parameters.stepSize) - (height / 2)
    }
  };
};

/**
 * Gravity grid
 *
 * @class GravityGrid
 * @constructor
 * @requires THREE, TWEEN
 */
function GravityGrid (options) {
  var group = new THREE.Object3D();

  var grid = new Grid({
    stepsX: 30,
    stepsY: 30,
    linesColor: options.linesColor || '#666666'
  });
  group.add(grid.el);

  var size = grid.getSize();
  var rangeX = size.x;
  var rangeY = size.y;

  var sphereRadius = 5;
  var mass = 5;
  var sphereGeometry = new THREE.SphereGeometry(sphereRadius, 20, 20);
  var sphereMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff'
  });
  var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.set(0, 30, 40);
  group.add(sphereMesh);

  var satelliteA = sphereMesh.clone();
  var satelliteB = sphereMesh.clone();

  satelliteA.scale.x = satelliteA.scale.y = satelliteA.scale.z = 0.5;
  satelliteB.scale.x = satelliteB.scale.y = satelliteB.scale.z = 0.25;

  satelliteA.position.z = 6;
  satelliteB.position.z = 6;

  var massA = 2.5;
  var massB = 2;

  group.add(satelliteA);
  group.add(satelliteB);
  
  var cache = { xA: 0, yA: 0, xB: 0, yB: 0 };

  function setIdleTween (paused) {
    var properties = {
      bezier: {
        type: 'soft',
        values: [
          {
            xA: random(rangeX.min, rangeX.max),
            yA: random(rangeX.min, rangeX.max),
            xB: random(rangeX.min, rangeX.max),
            yB: random(rangeY.min, rangeY.max)
          },
          {
            xA: random(rangeX.min, rangeX.max),
            yA: random(rangeX.min, rangeX.max),
            xB: random(rangeX.min, rangeX.max),
            yB: random(rangeY.min, rangeY.max)
          }
        ]
      },
      onUpdate: function () {
        satelliteA.position.x = this.target.xA;
        satelliteA.position.y = this.target.yA;

        satelliteB.position.x = this.target.xB;
        satelliteB.position.y = this.target.yB;

        grid.resetForce();
        grid.applyForce(sphereMesh.position, mass);
        grid.applyForce(satelliteA.position, massA);
        grid.applyForce(satelliteB.position, massB);
      },
      onComplete: function () {
        idleTween = setIdleTween();
      }
    };

    if (paused) {
      properties.paused = true;
    }

    return TweenLite.to(cache, 2, properties);
  }

  var idleTween = setIdleTween(true);
  
  // animate for 50 ms to put the sphere in the right position
  idleTween.resume();
  TweenLite.delayedCall(0.1, function () {
    idleTween.pause();
  });

  this.el = group;

  this.in = function () {
    TweenLite.to(sphereMesh.position, 1, {
        x: (rangeX.max + rangeX.min) / 2,
        y: (rangeY.max + rangeY.min) / 2,
        z: 5,
        delay: 0.2
      });
  };

  this.out = function () {
    TweenLite.to(sphereMesh.position, 1, { x: 0, y: 30, z: 40, delay: 0.2 });
  };

  this.start = function () {
    idleTween.resume();
  };

  this.stop = function () {
    idleTween.pause();
  };
}

module.exports = GravityGrid;