/* jshint laxbreak: true */

'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var Events = require('../classes/EventsClass');

var random = require('../utils/randomUtil');
var map = require('../utils/mapUtil');

/**
 * @class HeightMap
 * @constructor
 * @param {Object} [options]
 * @param {Boolean} [options.horizontal=true]
 * @param {Boolean} [options.vertical=false]
 * @param {Boolean} [options.plane=false]
 * @param {Boolean} [options.points=false]
 * @param {Number} [options.divisionsX=30]
 * @param {Number} [options.divisionsY=30]
 * @param {String} [options.fromColor='#4c4c4c']
 * @param {String} [options.toColor='#ffffff']
 * @param {Array} [options.maps=[]]
 * @requires THREE, TweenLite, Events, extend, random, map
 */
function HeightMap (options) {
  this.parameters = jQuery.extend({
    horizontal: true,
    vertical: false,
    plane: false,
    points: false,
    divisionsX: 30,
    divisionsY: 30,
    fromColor: '#4c4c4c',
    toColor: '#ffffff',
    maps: []
  }, options);

  this.events = new Events();

  // for setColors()
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

/**
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
 * @method loadMaps
 */
HeightMap.prototype.loadMaps = function () {
  var _this = this;

  var totalData = (this.parameters.divisionsX + 1) * (this.parameters.divisionsY + 1);
  this.data = { default: new Float32Array(totalData) };
  
  var loader = new THREE.ImageLoader();
  var total = this.parameters.maps.length;
  var loaded = 0;

  function addMap (name, image) {
    var width = image.width;
    var height = image.height;

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext('2d');

    context.drawImage(image, 0, 0);

    var stepX = width / _this.parameters.divisionsX;
    var stepY = height / _this.parameters.divisionsY;

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
  }

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
 * @method on
 */
HeightMap.prototype.on = function () {
  this.events.on.apply(this.events, arguments);
};

/**
 * @method trigger
 */
HeightMap.prototype.trigger = function () {
  this.events.trigger.apply(this.events, arguments);
};

module.exports = HeightMap;



// 'use strict';

// var jQuery = require('jquery');
// var THREE = require('three');

// var Events = require('../classes/EventsClass');

// var random = require('../utils/randomUtil');
// var map = require('../utils/mapUtil');

// /**
//  * Animated height map
//  *
//  * @class HeightMap
//  * @constructor
//  * @param {Object} [options]
//  * @param {Boolean} [options.horizontalLines=true] Display horizontal lines?
//  * @param {Boolean} [options.verticalLines=false] Display vertical lines?
//  * @param {Boolean} [options.plane=false] Display plane?
//  * @param {Boolean} [options.points=false] Display points?
//  * @param {Number} [options.resolutionX=30] x axis plane's subdivisions
//  * @param {Number} [options.resolutionY=30] y axis plane's subdivisions
//  * @param {String} [options.fromColor='#4c4c4c'] Color when a point is at z = 0
//  * @param {String} [options.toColor='#ffffff'] Color when a point is at maximum z
//  * @param {Array} [options.maps=[]] Maps to load (can also be added through addMap) with the structure { name: '', url: '' }
//  * @requires jQuery, THREE, TWEEN, map, random
//  */
// function HeightMap (options) {
//   // private
//   this.parameters = jQuery.extend({
//     horizontalLines: true,
//     verticalLines: false,
//     plane: false,
//     points: false,
//     resolutionX: 30,
//     resolutionY: 30,
//     fromColor: '#4c4c4c',
//     toColor: '#ffffff',
//     maps: []
//   }, options);

//   this.geometry = null;
//   this.lines = null; // number
//   this.defaultData = null; // array
//   this.mapsData = {};
//   this.previousMap = undefined; // number
//   this.currentMap = undefined; // number
//   this.colorsCache = {}; // cache vertices colors
//   this.events = new Events();

//   // public
//   this.el = null;
//   this.animations = {};

//   this.init();
// }

// HeightMap.prototype.on = function () {
//   this.events.on.apply(this.events, arguments);
// };

// HeightMap.prototype.trigger = function () {
//   this.events.trigger.apply(this.events, arguments);
// };

// /**
//  * Add a new map
//  *
//  * @method addMap
//  * @param {String} [name] Map's name
//  * @param {Image} [image] Loaded image
//  */
// HeightMap.prototype.addMap = function (name, image) {
//   var imageWidth = image.width;
//   var imageHeight = image.height;

//   var canvas = document.createElement('canvas');
//   canvas.width = imageWidth;
//   canvas.height = imageHeight;
//   var context = canvas.getContext('2d');

//   context.drawImage(image, 0, 0);

//   var totalData = (this.parameters.resolutionX + 1) * (this.parameters.resolutionY + 1);
//   var stepX = imageWidth / this.parameters.resolutionX;
//   var stepY = imageHeight / this.parameters.resolutionY;

//   var data = new Float32Array(totalData);
//   var i = 0;

//   // get the data
//   for (var y = 0; y < imageHeight; y += stepY) {
//     for (var x = 0; x < imageWidth; x += stepX) {
//       var pixelData = context.getImageData(x, y, 1, 1).data;
//       // Luminance = R + G + B
//       // int8 must be in -127, 127 range
//       // Max luminance = 765 (255 * 3), dividing by 10 ensures it can only be 76.5 at max
//       data[i++] = (pixelData[0] + pixelData[1] + pixelData[2]) / 10;
//     }
//   }

//   this.mapsData[name] = data;
// };

// /**
//  * Apply the current map to the geometry
//  *
//  * @method applyMap
//  */
// HeightMap.prototype.applyMap = function () {
//   // names
//   var previousName = typeof this.previousMap === 'undefined'
//     ? 'default'
//     : this.parameters.maps[this.previousMap].name;

//   var currentName = this.parameters.maps[this.currentMap].name;

//   // data
//   var previousData = previousName === 'default'
//     ? this.defaultData
//     : this.mapsData[previousName];

//   var currentData = this.mapsData[currentName];

//   // update
//   var _this = this;

//   TweenLite.to({ factor: 1 }, 1, { factor: 0, ease: window.Elastic.easeOut,
//     onUpdate: function () {

//       for (var i = 0, j = _this.geometry.vertices.length; i < j; i++) {
//         var vertex = _this.geometry.vertices[i];
//         var offset = currentData[i] + ((previousData[i] - currentData[i]) * this.target.factor);
//         vertex.z = offset / 10;
//       }

//       _this.geometry.verticesNeedUpdate = true;

//       if (_this.lines) {
//         for (var k = 0, l = _this.lines.children.length; k < l; k++) {
//           _this.lines.children[k].geometry.verticesNeedUpdate = true;
//         }
//       }

//       _this.setVerticesColors();
//     }
//   });

//   this.previousMap = this.currentMap;
// };

// /**
//  * Create the height maps animation
//  *
//  * @method setAnimation
//  */
// HeightMap.prototype.setAnimation = function () {
//   var _this = this;

//   // this.animations.idle = new TWEEN.Tween(null)
//   //   .to(null, 0)
//   //   .delay(1000)
//   //   .onComplete(function () {
//   //     _this.currentMap++;

//   //     if (_this.currentMap === _this.parameters.maps.length) {
//   //       _this.currentMap = 0;
//   //     }

//   //     _this.applyMap();

//   //     _this.animations.idle.delay(random(200, 1000));
//   //     _this.animations.idle.start();
//   //   });

//   this.animations.idle = null;
// };

// /**
//  * Set the vertices colors
//  *
//  * @method setVerticesColors
//  */
// HeightMap.prototype.setVerticesColors = function () {
//   // cached values
//   if (!this.fromColor) {
//     this.fromColor = new THREE.Color(this.parameters.fromColor);
//   }

//   if (!this.toColor) {
//     this.toColor = new THREE.Color(this.parameters.toColor);
//   }

//   if (!this.faceIndices) {
//     this.faceIndices = ['a', 'b', 'c', 'd'];
//   }

//   // set vertex colors
//   // for points and plane
//   if (this.parameters.plane) {
//     for (var i = 0, j = this.geometry.faces.length; i < j; i++) {
//       var face = this.geometry.faces[i];

//       // Assumption : instanceof THREE.Face3
//       for (var k = 0; k < 3; k++) {
//         var vertexIndex = face[this.faceIndices[k]];
//         var vertex = this.geometry.vertices[vertexIndex];

//         // (255 + 255 + 255) / 10 = 76.5, 76.5 / 20 = 3.8
//         var percent = map(vertex.z, [0, 3.8], [0, 2]);
//         percent = Math.round(percent * 10) / 10;

//         if (!this.colorsCache[percent]) {
//           this.colorsCache[percent] = this.fromColor.clone().lerp(this.toColor, percent);
//         }

//         face.vertexColors[k] = this.colorsCache[percent];
//       }
//     }

//     this.geometry.colorsNeedUpdate = true;
//   }

//   // set vertex colors
//   // for lines
//   if (this.parameters.horizontalLines || this.parameters.verticalLines) {
//     for (var l = 0, m = this.lines.children.length; l < m; l++) {
//       var line = this.lines.children[l];
//       // line.geometry.verticesNeedUpdate = true;

//       for (var n = 0, o = line.geometry.vertices.length; n < o; n++) {
//         var vertex = line.geometry.vertices[n];

//         // (255 + 255 + 255) / 10 = 76.5, 76.5 / 20 = 3.8
//         var percent = map(vertex.z, [0, 3.8], [0, 1]);
//         percent = Math.round(percent * 10) / 10;

//         if (!this.colorsCache[percent]) {
//           this.colorsCache[percent] = this.fromColor.clone().lerp(this.toColor, percent);
//         }

//         line.geometry.colors[n] = this.colorsCache[percent];
//       }

//       line.geometry.colorsNeedUpdate = true;
//     }
//   }
// };

// /**
//  * Initialize
//  *
//  * @method init
//  */
// HeightMap.prototype.init = function () {
//   var group = new THREE.Object3D();

//   var planeGeometry = new THREE.PlaneGeometry(
//     50,
//     50,
//     this.parameters.resolutionX,
//     this.parameters.resolutionY
//   );

//   if (this.parameters.plane) {
//     var planeMaterial = new THREE.MeshLambertMaterial({
//       shading: THREE.FlatShading,
//       // vertexColors: THREE.VertexColors
//       map: THREE.ImageUtils.loadTexture('./img/heightMap-A.jpg')
//     });
//     var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
//     group.add(planeMesh);
//   }

//   // points
//   if (this.parameters.points) {
//     var pointCloudMaterial = new THREE.PointCloudMaterial({ size: 0.3 });
//     var pointCloud = new THREE.PointCloud(planeGeometry, pointCloudMaterial);
//     group.add(pointCloud);
//   }

//   // Lines
//   if (this.parameters.horizontalLines || this.parameters.verticalLines) {
//     var lineMaterial = new THREE.LineBasicMaterial({
//       vertexColors: THREE.VertexColors
//     });
//     var linesGroup = new THREE.Object3D();

//     // vertical
//     if (this.parameters.verticalLines) {
//       for (var x = 0; x < this.parameters.resolutionX + 1; x++) {
//         var lineGeometry = new THREE.Geometry();

//         for (var y = 0; y < this.parameters.resolutionY + 1; y++) {
//           var vertex = planeGeometry.vertices[x + ((y * this.parameters.resolutionX) + y)];
//           lineGeometry.vertices.push(vertex);
//         }

//         var line = new THREE.Line(lineGeometry, lineMaterial);
//         linesGroup.add(line);
//       }
//     }

//     // horizontal
//     if (this.parameters.horizontalLines) {
//       for (var y = 0; y < this.parameters.resolutionY + 1; y++) {
//         var lineGeometry = new THREE.Geometry();

//         for (var x = 0; x < this.parameters.resolutionX + 1; x++) {
//           var vertex = planeGeometry.vertices[(y * (this.parameters.resolutionX + 1)) + x];
//           lineGeometry.vertices.push(vertex);

//           if (x === 0) {
//             vertex.x -= random(0, 20);
//           }

//           if (x === this.parameters.resolutionX) {
//             vertex.x += random(0, 20);
//           }
//         }

//         var line = new THREE.Line(lineGeometry, lineMaterial);
//         linesGroup.add(line);
//       }
//     }

//     group.add(linesGroup);
//   }

//   this.el = group;
//   this.geometry = planeGeometry;
//   this.lines = linesGroup;

//   // setup default data (only 0's)
//   var totalData = (this.parameters.resolutionX + 1) * (this.parameters.resolutionY + 1);
//   this.defaultData = new Float32Array(totalData);

//   // load and setup the maps
//   var _this = this;
//   var loader = new THREE.ImageLoader();
//   var totalMaps = this.parameters.maps.length;
//   var loadedMaps = 0;

//   /**
//    * Load a map image
//    * apply it or start the animation
//    *
//    * @method loadMap
//    * @param {Object} [map] Map with the structure with the structure { name: '', url: '' }
//    * @param {Number} [index] Index to determine the course of actions
//    */
//   function loadMap (map, index) {
//     loader.load(map.url, function (image) {
//       _this.addMap(map.name, image);

//       loadedMaps++;

//       if (loadedMaps === 1) {
//         _this.currentMap = index;
//         _this.applyMap();
//       }

//       if (loadedMaps === totalMaps) {
//         _this.setAnimation();
//         _this.trigger('ready');
//       }

//     });
//   }

//   for (var i = 0; i < totalMaps; i++) {
//     var map = this.parameters.maps[i];
//     loadMap(map, i);
//   }

// };

// module.exports = HeightMap;