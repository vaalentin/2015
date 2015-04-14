'use strict';

var THREE = require('three');

/**
 * Dilate a geometry along the normals
 *
 * @method dilate
 * @param {THREE.Object3D} [geometry] Geometry to dilate
 * @param {Number} [offset] Desired offset
 */
function dilate (geometry, offset) {
  geometry.computeVertexNormals();

  // vertices normals
  var vertexNormals = new Array(geometry.vertices.length);

  for (var i = 0, j = geometry.faces.length; i < j; i++) {
    var face = geometry.faces[i];
    
    if (face instanceof THREE.Face4) {
      vertexNormals[face.a] = face.vertexNormals[0];
      vertexNormals[face.b] = face.vertexNormals[1];
      vertexNormals[face.c] = face.vertexNormals[2];
      vertexNormals[face.d] = face.vertexNormals[3]; 
    } else if (face instanceof THREE.Face3) {
      vertexNormals[face.a] = face.vertexNormals[0];
      vertexNormals[face.b] = face.vertexNormals[1];
      vertexNormals[face.c] = face.vertexNormals[2];
    }
  }

  // offset vertices
  for (var k = 0, l = geometry.vertices.length; k < l; k++) {
    var vertex = geometry.vertices[k];
    var normal = vertexNormals[k];

    vertex.x += normal.x * offset;
    vertex.y += normal.y * offset;
    vertex.z += normal.z * offset;
  }
}

module.exports = dilate;