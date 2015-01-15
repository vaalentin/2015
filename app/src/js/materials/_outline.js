'use strict';

var THREE = require('three');

/**
 * Basic material that accepts vec4 as vertices colors (rgba).
 *
 * @attribute {Object} [customColor]
 * @attribute {Array} [customColor.value]
 */
var outlineShader = new THREE.ShaderMaterial({
  uniforms: {
    time: { type: 'f', value: 1 }
  },
  attributes: {
    customColor: { type: 'v4', value: [] }
  },
  vertexShader: [

    'attribute vec4 customColor;',
    'varying vec4 vColor;',

    'void main () {',
      'vColor = customColor;',
      'gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));',
    '}'

  ].join('\n'),
  fragmentShader: [

    'uniform float time;',
    'varying vec4 vColor;',

    'void main () {',
      'gl_FragColor = vColor;',
      'gl_FragColor.a += sin(time) - time;',
    '}'

  ].join('\n'),
  transparent: true,
  side: THREE.BackSide
});

module.exports = outlineShader;