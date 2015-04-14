'use strict';

var THREE = require('three');

var dilate = require('../utils/dilateUtil');

var outlineMaterial = require('../materials/outlineMaterial');

function City () {
  this.el = new THREE.Object3D();

  this.groups = {};
  this.baseMaterial = new THREE.MeshLambertMaterial({ color: '#333333' });

  this.loader = new THREE.JSONLoader();
}

City.prototype.addGroup = function (data) {
  if (!this.groups[data.name]) {
    this.groups[data.name] = new THREE.Object3D();
  }

  if (!data.outline) {
    data.outline = {};
  }

  var groupName = data.name;

  for (var objName in data.objs) {
    if (data.objs.hasOwnProperty(objName)) {
      var url = data.objs[objName];

      if (!data.outline[objName]) {
        data.outline[objName] = {};
      }

      var isSolid = data.outline[objName].solid ? true : false;
      var offset = data.outline[objName].offset
        ? data.outline[objName].offset
        : 0.15;

      this.loadObj(groupName, url, offset, isSolid);
    }
  }
};

City.prototype.loadObj = function (groupName, url, offset, isSolid) {
  var _this = this;

  this.loader.load(url, function (geometry) {
    _this.processObj({
      geometry: geometry,
      group: groupName,
      offset: offset,
      solid: isSolid
    });
  });
};

City.prototype.processObj = function (data) {
  var groupName = data.group;
  var geometry = data.geometry;

  var mesh = new THREE.Mesh(geometry, this.baseMaterial);

  this.groups[groupName].add(mesh);

  var outlineGeometry = geometry.clone();
  dilate(outlineGeometry, data.offset);

  var localOutlineMaterial = outlineMaterial.clone();
  localOutlineMaterial.uniforms = THREE.UniformsUtils.clone(outlineMaterial.uniforms);
  localOutlineMaterial.attributes = THREE.UniformsUtils.clone(outlineMaterial.attributes);

  var outlineMesh = new THREE.Mesh(outlineGeometry, localOutlineMaterial);

  outlineGeometry.computeBoundingBox();
  var height = outlineGeometry.boundingBox.max.y - outlineGeometry.boundingBox.min.y;

  for (var i = 0, j = outlineGeometry.vertices.length; i < j; i++) {
    var color;

    if (data.solid) {
      color = new THREE.Vector4(0.7, 0.7, 0.7, 1.0);
    } else {
      var vertex = outlineGeometry.vertices[i];
      var percent = Math.floor(vertex.y * 100 / height) - 10;
      color = new THREE.Vector4(0.7, 0.7, 0.7, percent / 100);
    }

    localOutlineMaterial.attributes.customColor.value[i] = color;
  }

  this.groups[groupName].add(outlineMesh);
};

City.prototype.showGroup = function (name) {
  this.el.add(this.groups[name]);
};

module.exports = City;