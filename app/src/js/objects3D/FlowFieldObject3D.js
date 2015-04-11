'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var random = require('../utils/randomUtil');
var noise = require('../utils/noiseUtil');
var map = require('../utils/mapUtil');

/**
 * 3D Flow field
 * Fake flocking
 *
 * @param {Array} [points] MainCurve's points
 * @param {Object} [options]
 * @param {Object} [options.subsNumber=3] SubCurves number
 * @param {Number} [options.subsAmplitude=30] SubCurves amplitude
 * @param {Number} [options.subsPrecision=10] SubCurves precision (=subdivisions)
 * @param {Number} [options.noiseXincrement=0.1] SubCurves x noise
 * @param {Number} [options.moiseYincrement=0.1] SubCurves y noise
 * @param {Number} [options.noiseZincrement=0.1] SubCurves z noise
 * @param {Number} [options.renderResolution=100] SubCurves render precision (=subdivisions)
 * @param {String} [options.mainColor='#ffffff'] MainCurve's color
 * @param {String} [options.subsColor='#4c4c4c'] SubCurves color
 * @requires jQuery, THREE, TweenLite, random, noise, map
 */
function FlowField (points, options) {
  this.parameters = jQuery.extend(FlowField.defaultOptions, options);

  var group = new THREE.Object3D();

  var curves = this.getCurves(points);
  var main = curves.main;
  var subs = curves.subs;
  var lines = this.getLines(main, subs);
  var inTweens = [];

  for (var i = 0, j = lines.length; i < j; i++) {
    group.add(lines[i]);
    inTweens.push(this.getInTween(lines[i]));
  }

  var triangleGeometry = new THREE.TetrahedronGeometry(3);
  var triangleMaterial = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading });
  var triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);

  var follow = this.getFollow(triangleMesh, subs);

  for (var k = 0, l = follow.meshes.length; k < l; k++) {
    group.add(follow.meshes[k]);
  }

  this.el = group;

  this.in = function () {
    for (var i = 0, j = inTweens.length; i < j; i++) {
      inTweens[i].restart();
    }
  };

  this.out = function () {
    for (var i = 0, j = inTweens.length; i < j; i++) {
      inTweens[i].reverse();
    }
  };

  this.start = function () {
    for (var i = 0, j = follow.tweens.length; i < j; i++) {
      follow.tweens[i].resume();
    }
  };

  this.stop = function () {
    for (var i = 0, j = follow.tweens.length; i < j; i++) {
      follow.tweens[i].pause();
    }
  };
}

FlowField.defaultOptions = {
  subsNumber: 3,
  subsAmplitude: 30,
  subsPrecision: 10,
  noiseXincrement: 0.1,
  moiseYincrement: 0.1,
  noiseZincrement: 0.1,
  renderResolution: 100,
  mainColor: '#ffffff',
  subsColor: '#4c4c4c',
  subsHiddenColo: '#0a0a0a'
};

/**
 * Get main and subs curves
 *
 * @method getCurves
 * @return {Object}
 */
FlowField.prototype.getCurves = function (points) {
  var main = new THREE.SplineCurve3(points);

  var subsPoints = main.getPoints(this.parameters.subsPrecision);

  var subs = [];

  for (var i = 0; i < this.parameters.subsNumber; i++) {
    var noiseX = random(0, 10);
    var noiseY = random(0, 10);
    var noiseZ = random(0, 10);

    var newPoints = [];
    for (var j = 0, k = subsPoints.length; j < k; j++) {
      var point = subsPoints[j].clone();

      point.x += map(noise(noiseX), [0, 1], [-this.parameters.subsAmplitude, this.parameters.subsAmplitude]);
      point.y += map(noise(noiseY), [0, 1], [-this.parameters.subsAmplitude, this.parameters.subsAmplitude]);
      point.z += map(noise(noiseZ), [0, 1], [-this.parameters.subsAmplitude, this.parameters.subsAmplitude]);

      noiseX += this.parameters.noiseXincrement;
      noiseY += this.parameters.moiseYincrement;
      noiseZ += this.parameters.noiseZincrement;

      newPoints.push(point);
    }

    subs.push(new THREE.SplineCurve3(newPoints));
  }

  return {
    main: main,
    subs: subs
  };
};

/**
 * Get lines
 *
 * @method getLines
 * @param {THREE.SplineCurve3} [main] Main curve
 * @param {Array} [subs] Sub curves
 * @return {Array}
 */
FlowField.prototype.getLines = function (main, subs) {
  var lines = [];

  var mainMaterial = new THREE.LineBasicMaterial({ color: this.parameters.mainColor });

  var mainGeometry = new THREE.Geometry();
  var mainPoints = main.getPoints(this.parameters.renderResolution);
  mainGeometry.vertices = mainPoints;

  var mainLine = new THREE.Line(mainGeometry, mainMaterial);
  mainLine.visible = false;
  lines.push(mainLine);

  var subMaterial = new THREE.LineBasicMaterial({ color: this.parameters.subsColor });

  for (var i = 0, j = subs.length; i < j; i++) {
    var subGeometry = new THREE.Geometry();
    var subPoints = subs[i].getPoints(this.parameters.renderResolution);
    subGeometry.vertices = subPoints;

    var subLine = new THREE.Line(subGeometry, subMaterial);
    subLine.visible = false;
    lines.push(subLine);
  }

  return lines;
};

/**
 * Get in animation
 *
 * @method getInTween
 * @param {THREE.Line} [line] Line to animate
 * @return {TweenLite}
 */
FlowField.prototype.getInTween = function (line) {
  return TweenLite.to({}, random(1, 3), { paused: true,
      onComplete: function () {
        line.visible = true;

        TweenLite.delayedCall(0.2, function () {
          line.visible = false;
        });

        TweenLite.delayedCall(0.3, function () {
          line.visible = true;
        });
      },
      onReverseComplete: function () {
        line.visible = false;
      }
    });
};

/**
 * Get follow animatiom
 *
 * @method getFollor
 * @param {THREE.Mesh} Mesh following
 * @param {Array} Curves
 * @return {Object}
 */
FlowField.prototype.getFollow = function (mesh, curves) {
  var meshes = [];
  var tweens = [];

  function getTween (mesh, sub) {
    return TweenLite.to({ i: 0 }, random(4, 8), { i: 1, paused: true, ease: window.Linear.easeNone,
        onUpdate: function () {
          var position = sub.getPoint(this.target.i);
          var rotation = sub.getTangent(this.target.i);
          
          mesh.position.set(position.x, position.y, position.z);
          mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        },
        onComplete: function () {
          this.restart();
        }
      });
  }

  for (var i = 0, j = curves.length; i < j; i++) {
    var meshCopy = mesh.clone();
    var curve = curves[i];

    meshes.push(meshCopy);
    tweens.push(getTween(meshCopy, curve));
  }

  return {
    tweens: tweens,
    meshes: meshes
  };
};

module.exports = FlowField;