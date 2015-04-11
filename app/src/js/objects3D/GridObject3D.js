'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var random = require('../utils/randomUtil');
var yoyo = require('../utils/yoyoUtil');

/**
 * Animated grid
 *
 * @class Grid
 * @constructor
 * @param {Object} [options]
 * @param {Boolean} [options.points=false] Points?
 * @param {Number} [options.divisionsSize=10] Divisions size
 * @param {Number} [options.divisionsX=11] X axis divisions
 * @param {Number} [options.divisionsY=11] Y axis divisions
 * @param {String} [options.fromColor='#ffffff'] On color
 * @param {String} [options.toColor='#0a0a0a'] Off color
 * @requires jQuery, THREE, TweenLite, random, yoyo
 */
function Grid (options) {
  this.parameters = jQuery.extend(Grid.defaultOptions, options);

  this.width = (this.parameters.divisionsX - 1) * this.parameters.divisionsSize;
  this.height = (this.parameters.divisionsY - 1) * this.parameters.divisionsSize;

  var group = new THREE.Object3D();

  var vertices = this.getVertices();

  if (this.parameters.points) {
    var pointsGeometry = new THREE.Geometry();

    for (var i = 0, j = vertices.length; i < j; i++) {
      pointsGeometry.vertices.push(vertices[i][0]);
      pointsGeometry.vertices.push(vertices[i][1]);
      pointsGeometry.vertices.push(vertices[i][2]);
    }
    
    var pointsMaterial = new THREE.PointCloudMaterial({ size: 0.2 });
    var points = new THREE.PointCloud(pointsGeometry, pointsMaterial);

    group.add(points);
  }

  var lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors,
    linewidth: 1
  });

  var colorsCache = {};
  var fromColor = new THREE.Color(this.parameters.fromColor);
  var toColor = new THREE.Color(this.parameters.toColor);

  var idleTweens = [];

  for (var k = 0, l = vertices.length; k < l; k++) {
    var lineGeometry = new THREE.Geometry();

    var firstTo = vertices[k][0].clone();
    var secondTo = vertices[k][2].clone();

    lineGeometry.vertices.push(vertices[k][1].clone());
    lineGeometry.vertices.push(vertices[k][1]);
    lineGeometry.vertices.push(vertices[k][1].clone());

    for (var m = 0, n = lineGeometry.vertices.length; m < n; m++) {

      var color = null;
      var percent = null;

      if (k >= this.parameters.divisionsX) {
        // horizontal
        var y = lineGeometry.vertices[m].y;
        percent = Math.abs((y * 100 / this.height) / 100);
      } else {
        // vertical
        var x = lineGeometry.vertices[m].x;
        percent = Math.abs((x * 100 / this.width) / 100);
      }

      if (!colorsCache[percent]) {
        color = fromColor.clone().lerp(toColor, percent + 0.2);
        colorsCache[percent] = color;
      } else {
        color = colorsCache[percent];
      }

      lineGeometry.colors.push(toColor);
      lineGeometry.colors.push(color);
      lineGeometry.colors.push(toColor);
    }

    var line = new THREE.Line(lineGeometry, lineMaterial);

    idleTweens.push(this.getTween(line, line.geometry.vertices[0], firstTo));
    idleTweens.push(this.getTween(line, line.geometry.vertices[2], secondTo));
    
    group.add(line);
  }

  this.el = group;

  this.start = function () {
    for (var i = 0, j = idleTweens.length; i < j; i++) {
      idleTweens[i].resume();
    }
  };

  this.stop = function () {
    for (var i = 0, j = idleTweens.length; i < j; i++) {
      idleTweens[i].pause();
    }
  };

  this.in = function () {
    TweenLite.to(group.position, 1, { y: 0 });
  };

  this.out = function (way) {
    var y = way === 'up' ? -50 : 50;
    TweenLite.to(group.position, 1, { y: y });
  };
}

Grid.defaultOptions = {
  points: false,
  divisionsSize: 10,
  divisionsX: 11,
  divisionsY: 11,
  fromColor: '#ffffff',
  toColor: '#0a0a0a'
};

/**
 * Get vertices
 *
 * @method getVertices
 * @return {Array} vertices
 */
Grid.prototype.getVertices = function () {
  var vertices = [];

  // horizontal
  for (var x = 0; x < this.parameters.divisionsX; x++) {
    var xPosH = (x * this.parameters.divisionsSize) - (this.width / 2);
    var yPosH = this.height - (this.height / 2);

    vertices.push([
      new THREE.Vector3(xPosH, -this.height / 2, 0),
      new THREE.Vector3(xPosH, yPosH - (this.height / 2) , 0),
      new THREE.Vector3(xPosH, yPosH, 0)
    ]);
  }

  // vertical
  for (var y = 0; y < this.parameters.divisionsY; y++) {
    var xPosV = this.width - (this.width / 2);
    var yPosV = (y * this.parameters.divisionsSize) - (this.height / 2);

    vertices.push([
      new THREE.Vector3(-this.width / 2, yPosV, 0),
      new THREE.Vector3(xPosV - (this.width / 2), yPosV, 0),
      new THREE.Vector3(xPosV, yPosV, 0)
    ]);
  }

  return vertices;
};

/**
 * Get line animation
 *
 * @method getTween
 * @param {THREE.Line} [line] Line to animate
 * @param {THREE.Vector3} [from] Start coordinates
 * @param {THREE.Vector3} [to] End coordinates
 */
Grid.prototype.getTween = function (line, from, to) {
  var parameters = {
    paused: true,
    delay: random(0, 2),
    onUpdate: function () {
      line.geometry.verticesNeedUpdate = true;
      line.geometry.computeBoundingSphere();
    },
    onComplete: yoyo,
    onReverseComplete: yoyo,
    x: to.x,
    y: to.y,
    z: to.z
  };

  return TweenLite.to(from, random(1, 2), parameters);
};

module.exports = Grid;