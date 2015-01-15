'use strict';

var THREE = require('three');

var matCap = new THREE.ShaderMaterial({
  uniforms: {
    map: { type: 't', value: null }
  },
  vertexShader: [

    'varying vec2 vN;',

    'varying vec2 vUv;',
    'uniform float morphTargetInfluences[4];',

    'void main() {',
        // morphtargets
        'vUv = uv;',
        'vec3 morphed = vec3( 0.0 , 0.0 , 0.0 );',
        'morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];',
        'morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];',
        'morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];',
        'morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];',
        'morphed += position;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( morphed, 1.0 );',

        // matCap
        'vec4 p = vec4( position, 1. );',

        'vec3 e = normalize( vec3( modelViewMatrix * p ) );',
        'vec3 n = normalize( normalMatrix * normal );',

        'vec3 r = reflect( e, n );',
        'float m = 2. * sqrt( ',
            'pow( r.x, 2. ) + ',
            'pow( r.y, 2. ) + ',
            'pow( r.z + 1., 2. ) ',
        ');',
        'vN = r.xy / m + .5;',
    '}'

  ].join('\n'),
  fragmentShader: [

    'uniform sampler2D map;',

    'varying vec2 vN;',

    'void main() {    ',
        'vec3 base = texture2D( map, vN ).rgb;',
        'gl_FragColor = vec4( base, 1. );',
    '}'

  ].join('\n'),
  shading: THREE.SmoothShading,
  side: THREE.DoubleSide
});

module.exports = matCap;