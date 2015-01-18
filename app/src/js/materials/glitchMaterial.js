'use strict';

var THREE = require('three');

var glitch = new THREE.ShaderMaterial({
  uniforms: {
    time: { type: 'f', value: 10.0 },
    resolution: { type: 'v2', value: new THREE.Vector2(10, 10) },
    fInverseViewportDimensions: { type: 'v2', value: new THREE.Vector2(10, 10) }
  },
  vertexShader: [

    'void main () {',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'

  ].join('\n'),
  fragmentShader: [

    'float time;',
    'uniform vec2 resolution;',
    'vec2 fInverseViewportDimensions;',

    'vec2 rota (vec2 p, float theta) {',
      'vec2 q;',
      'q.x = cos(theta) * p.x - sin(theta) * p.y;',
      'q.y = sin(theta) * p.y + cos(theta) * p.x;',
      'return q;',
    '}',

    'vec4 ConvertToVPos (vec4 p) {',
      'return vec4(0.5*(vec2(p.x + p.w, p.w - p.y) + p.w * fInverseViewportDimensions.xy), p.zw);',
    '}',

    'void main (void) {',
      'time = 1.0;',
      'vec2 p = (vec2(1, 1).xy / resolution.xy) - 0.5;',

      'for (float i = 0.0; i < 1.0; i++) {',
        'p = rota(p, time + length(p * 0.1) * (20.0 * cos(time * 0.5)));',
        'float s = 2.0;',
        'float dy = 1.0 / (5.0 * abs(p.y * s));',
        'gl_FragColor += vec4(dy * 0.1 * dy, 0.5 * dy, dy, 1.0);',
      '}',
    '}'

  ].join('\n')
});

module.exports = glitch;