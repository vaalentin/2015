/* jshint laxbreak: true */
/* jshint shadow:true */

'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var Events = require('../classes/EventsClass');

var random = require('../utils/randomUtil');
var map = require('../utils/mapUtil');

/**
 * Animated height map
 *
 * @class HeightMap
 * @constructor
 * @param {Object} [options]
 * @param {Boolean} [options.horizontal=true] Horizontal lines?
 * @param {Boolean} [options.vertical=false] Vertical lines?
 * @param {Boolean} [options.plane=false] Plane?
 * @param {Boolean} [options.points=false] Points?
 * @param {Number} [options.divisionsX=30] X axis divisions
 * @param {Number} [options.divisionsY=30] Y axis divisions
 * @param {String} [options.fromColor='#4c4c4c'] Height min color
 * @param {String} [options.toColor='#ffffff'] Height max color
 * @param {Array} [options.maps=[]] Maps sources
 * @requires jQuery, THREE, TweenLite, Events, random, map
 */
function HeightMap (options) {
  this.parameters = jQuery.extend(HeightMap.defaultOptions, options);

  this.events = new Events();

  this.fromColor = new THREE.Color(this.parameters.fromColor);
  this.toColor = new THREE.Color(this.parameters.toColor);
  this.colorsCache = {};
  this.faceIndices = ['a', 'b', 'c', 'd'];

  this.ready = false;
  this.data = null;
  this.total = this.parameters.maps.length;
  this.previous = undefined;
  this.current = undefined;

  var group = new THREE.Object3D();

  this.geometry = new THREE.PlaneGeometry(50, 50, this.parameters.divisionsX, this.parameters.divisionsY);

  if (this.parameters.plane) {
    this.plane = this.getPlane();
    group.add(this.plane);
  }

  if (this.parameters.points) {
    this.points = this.getPoints();
    group.add(this.points);
  }

  if (this.parameters.horizontal || this.parameters.vertical) {
    this.lines = this.getLines();
    group.add(this.lines);
  }

  this.loadMaps();

  this.el = group;

  this.start = function () {};
  
  this.stop = this.start;

  this.on('ready', function () {
    this.ready = true;

    var idleTween = this.getIdleTween();

    this.start = function () {
      idleTween.resume();
    };

    this.stop = function () {
      idleTween.pause();
    };
  }.bind(this));
}

HeightMap.defaultOptions = {
  horizontal: true,
  vertical: false,
  plane: false,
  points: false,
  divisionsX: 30,
  divisionsY: 30,
  fromColor: '#4c4c4c',
  toColor: '#ffffff',
  maps: []
};

/**
 * Get plane
 *
 * @method getPlane
 * @param {THREE.Geometry} geometry
 * @return {THREE.Mesh}
 */
HeightMap.prototype.getPlane = function () {
  var material = new THREE.MeshLambertMaterial({
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors
  });

  var plane = new THREE.Mesh(this.geometry, material);

  return plane;
};

/**
 * Get points
 *
 * @method getPoints
 * @param {THREE.Geometry} geometry
 * @return {THREE.PointCloud}
 */
HeightMap.prototype.getPoints = function () {
  var material = new THREE.PointCloudMaterial({ size: 0.3 });
  var points = new THREE.PointCloud(this.geometry, material);

  return points;
};

/**
 * Get lines
 *
 * @method getLines
 * @param {THREE.Geometry} geometry
 * @return {THREE.Object3D}
 */
HeightMap.prototype.getLines = function () {
  var material = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors
  });

  var lines = new THREE.Object3D();

  if (this.parameters.vertical) {
    for (var x = 0; x < this.parameters.divisionsX + 1; x++) {
      var lineGeometry = new THREE.Geometry();

      for (var y = 0; y < this.parameters.divisionsY + 1; y++) {
        var vertex = this.geometry.vertices[x + ((y * this.parameters.divisionsX) + y)];
        lineGeometry.vertices.push(vertex);
      }

      var line = new THREE.Line(lineGeometry, material);
      lines.add(line);
    }
  }

  if (this.parameters.horizontal) {
    for (var y = 0; y < this.parameters.divisionsY + 1; y++) {
      var lineGeometry = new THREE.Geometry();

      for (var x = 0; x < this.parameters.divisionsX + 1; x++) {
        var vertex = this.geometry.vertices[(y * (this.parameters.divisionsX + 1)) + x];
        lineGeometry.vertices.push(vertex);

        if (x === 0) {
          vertex.x -= random(0, 20);
        }

        if (x === this.parameters.divisionsX) {
          vertex.x += random(0, 20);
        }
      }

      var line = new THREE.Line(lineGeometry, material);
      lines.add(line);
    }
  }

  return lines;
};

/**
 * Get animations
 *
 * @method getIdleTween
 * @return {TweenLite}
 */
HeightMap.prototype.getIdleTween = function () {
  var _this = this;

  return TweenLite.to({}, 2, { paused: true,
      onComplete: function () {
        _this.current++;

        if (_this.current === _this.total) {
          _this.current = 0;
        }

        _this.applyMap();

        this.duration(random(1.5, 5));
        this.restart();
      }
    });
};

/**
 * Load maps
 *
 * @method loadMaps
 */
HeightMap.prototype.loadMaps = function () {
  var totalData = (this.parameters.divisionsX + 1) * (this.parameters.divisionsY + 1);
  this.data = { default: new Float32Array(totalData) };
  
  var loader = new THREE.ImageLoader();
  var total = this.parameters.maps.length;
  var loaded = 0;

  var addMap = function (name, image) {
    var width = image.width;
    var height = image.height;

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext('2d');

    context.drawImage(image, 0, 0);

    var stepX = width / this.parameters.divisionsX;
    var stepY = height / this.parameters.divisionsY;

    var data = new Float32Array(totalData);
    var i = 0;

    for (var y = 0; y < height; y += stepY) {
      for (var x = 0; x < width; x += stepX) {
        var pixelData = context.getImageData(x, y, 1, 1).data;

        // Luminance = R + G + B
        // int8 must be in the [-127, 127] range
        // Max luminance = 765 (255 * 3), dividing by 10 ensures it can only be 76.5 at max
        data[i++] = (pixelData[0] + pixelData[1] + pixelData[2]) / 100;
      }
    }

    _this.data[name] = data;
  }.bind(this);

  var _this = this;
  
  function loadMap (map, index) {
    loader.load(map.url, function (image) {
      addMap(map.name, image);

      loaded++;

      if (loaded === 1) {
        _this.current = index;
        _this.applyMap();
      }

      if (loaded === total) {
        _this.trigger('ready');
      }
    });
  }

  for (var i = 0; i < total; i++) {
    var map = this.parameters.maps[i];
    loadMap(map, i);
  }
};

/**
 * Apply current map
 *
 * @method applyMap
 */
HeightMap.prototype.applyMap = function () {
  var previousName = typeof this.previous === 'undefined'
    ? 'default'
    : this.parameters.maps[this.previous].name;

  var currentName = this.parameters.maps[this.current].name;

  var previousData = this.data[previousName];
  var currentData = this.data[currentName];

  var _this = this;

  TweenLite.to({ factor: 1 }, 1, { factor: 0, ease: window.Elastic.easeOut,
      onUpdate: function () {

        for (var i = 0, j = _this.geometry.vertices.length; i < j; i++) {
          var vertex = _this.geometry.vertices[i];
          var offset = currentData[i] + ((previousData[i] - currentData[i]) * this.target.factor);
          vertex.z = offset;
        }

        _this.geometry.verticesNeedUpdate = true;

        if (_this.lines) {
          for (var k = 0, l = _this.lines.children.length; k < l; k++) {
            _this.lines.children[k].geometry.verticesNeedUpdate = true;
          }
        }

        _this.setColors();
      }
    });

  this.previous = this.current;
};

/**
 * Set lines/points/plane vertices colors
 *
 * @method setColors
 */
HeightMap.prototype.setColors = function () {
  // lines
  if (this.lines) {
    for (var i = 0, j = this.lines.children.length; i < j; i++) {
      var line = this.lines.children[i];

      for (var k = 0, l = line.geometry.vertices.length; k < l; k++) {
        var vertex = line.geometry.vertices[k];

        // (255 + 255 + 255) / 10 = 76.5, 76.5 / 20 = 3.8
        var percent = map(vertex.z, [0, 3.8], [0, 2]);
        percent = Math.round(percent * 10) / 10;

        if (!this.colorsCache[percent]) {
          this.colorsCache[percent] = this.fromColor.clone().lerp(this.toColor, percent);
        }

        line.geometry.colors[k] = this.colorsCache[percent];
      }

      line.geometry.colorsNeedUpdate = true;
    }
  }

  // planes/points
  if (this.plane || this.points) {
    for (var i = 0, j = this.geometry.faces.length; i < j; i++) {
      var face = this.geometry.faces[i];

      // Assumption : instanceof THREE.Face3
      for (var k = 0; k < 3; k++) {
        var vertexIndex = face[this.faceIndices[k]];
        var vertex = this.geometry.vertices[vertexIndex];

        // (255 + 255 + 255) / 10 = 76.5, 76.5 / 20 = 3.8
        var percent = map(vertex.z, [0, 3.8], [0, 2]);
        percent = Math.round(percent * 10) / 10;

        if (!this.colorsCache[percent]) {
          this.colorsCache[percent] = this.fromColor.clone().lerp(this.toColor, percent);
        }

        face.vertexColors[k] = this.colorsCache[percent];
      }
    }

    this.geometry.colorsNeedUpdate = true;
  }
};

/**
 * Listen to event bus
 *
 * @method on
 */
HeightMap.prototype.on = function () {
  this.events.on.apply(this.events, arguments);
};

/**
 * Trigger event on event bus
 *
 * @method trigger
 */
HeightMap.prototype.trigger = function () {
  this.events.trigger.apply(this.events, arguments);
};

module.exports = HeightMap;