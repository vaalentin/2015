'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var loop = require('../utils/loopUtil');

function Wave (options) {
  this.parameters = jQuery.extend({
    amplitude: 10,
    divisionSize: 2,
    divisionsX: 50,
    divisionsY: 50,
    speed: 10
  }, options);

  var plane = this.getPlane();

  var _this = this;
  
  var time = 0;

  var divisionsX = this.parameters.divisionsX;
  var divisionsY = this.parameters.divisionsY;

  function updateWave () {
    var i= 0;

    for (var x = 0; x <= divisionsX; x++) {
      for (var y = 0; y <= divisionsY; y++) {
        var vertex = plane.geometry.vertices[i++];
        vertex.z =
          (Math.sin(((x + 1) + time) * 0.2) * 2) +
          (Math.sin(((y + 1) + time) * 0.2) * 5);
      }
    }

    plane.geometry.verticesNeedUpdate = true;
    time += 0.1;
  }

  updateWave();

  var idleTween = TweenLite.to({}, 5, { paused: true, ease: window.Linear.easeNone,
    onUpdate: updateWave,
    onComplete: loop
  });

  this.el = plane;

  this.in = function (way) {
    plane.position.y = way === 'up' ? 20 : -20;
    TweenLite.to(plane.position, 1.5, { y: -10 });
  };

  this.out = function (way) {
    var y = way === 'up' ? -20 : 20;
    TweenLite.to(plane.position, 1, { y: y });
  };

  this.start = function () {
    idleTween.resume();
  };

  this.stop = function () {
    idleTween.pause();
  };

  delete this.parameters;
}

Wave.prototype.getPlane = function () {
  var texture = THREE.ImageUtils.loadTexture('../app/public/img/texture-wave.png');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);

  var material = new THREE.MeshLambertMaterial({
    map: texture,
    color: '#ffffff',
    side: THREE.DoubleSide
  });

  var geometry = new THREE.PlaneGeometry(
    this.parameters.divisionsX * this.parameters.divisionSize,
    this.parameters.divisionsY * this.parameters.divisionSize,
    this.parameters.divisionsX,
    this.parameters.divisionsY
  );

  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -20;
  mesh.rotation.x = -Math.PI / 2;

  return mesh;
};

module.exports = Wave;