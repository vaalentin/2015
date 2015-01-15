'use strict'
  
var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var random = require('../utils/randomUtil');

function LookAtField (options) {
  var parameters = jQuery.extend({
    count: 100
  }, options);

  var center = new THREE.Vector3(0, 50, 0);

  var triangleGeometry = new THREE.TetrahedronGeometry(3);

  var triangleMaterial = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading });
  var triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);

  var group = new THREE.Object3D();

  for (var i = 0; i < parameters.count; i++) {
    var triangleCopy = triangleMesh.clone();
    triangleCopy.position.x = random(-50, 50);
    triangleCopy.position.y = random(-50, 50);
    triangleCopy.position.z = random(-50, 30);

    triangleCopy.rotation.x = random(0, 2 * Math.PI);
    triangleCopy.rotation.y = random(0, 2 * Math.PI);
    triangleCopy.rotation.z = random(0, 2 * Math.PI);

    triangleCopy.scale.x = triangleCopy.scale.y = triangleCopy.scale.z = random(0.6, 1);

    triangleCopy.lookAt(center);

    group.add(triangleCopy);
  }

  group.position.y = -50;

  function update () {
    for (var i = 0; i < parameters.count; i++) {
      group.children[i].lookAt(center);
    }
  }

  this.in = function () {
    group.visible = true;
    TweenLite.to(center, 2, { y: 0, onUpdate: update });
    TweenLite.to(group.position, 1, { y: 0 });
  }

  this.out = function (way) {
    TweenLite.to(center, 1, { y: 50, onUpdate: update, onComplete: function () { group.visible = false; } });
    TweenLite.to(group.position, 1, { y: -50 });
  }

  this.el = group;
}

module.exports = LookAtField;