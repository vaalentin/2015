'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');
  
/**
 * Display a 2D text in 3D space
 *
 * @class TextPanel
 * @constructor
 * @param {String} [text] Text to display, use '\n' for line break
 * @param {Object} [options]
 * @param {Number} [options.size=100] Font size
 * @param {String} [options.font='Futura'] Fonts
 * @param {String} [options.style='Bold'] Font style
 * @param {String} [options.align='center'] Center, left or right
 * @param {Number} [options.lineSpacing=20] Height lines
 * @param {String} [options.color='rgba(200, 200, 200, 1)'] Text color
 * @requires jQuery, THREE, TweenLite
 */
function TextPanel (text, options) {
  var parameters = jQuery.extend(TextPanel.defaultOptions, options);

  text = text || '';

  // split and clean the words
  var words = text.split('\n');
  var wordsCount = words.length;
  for (var i = 0; i < wordsCount; i++) {
    words[i] = words[i].replace(/^\s+|\s+$/g, '');
  }

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  var font = parameters.style + ' ' + parameters.size + 'px' + ' ' + parameters.font;

  context.font = font;

  // max width
  var width;

  var maxWidth = 0;
  for (var j = 0; j < wordsCount; j++) {
    var tempWidth = context.measureText(words[j]).width;
    if (tempWidth > maxWidth) {
      maxWidth = tempWidth;
    }
  }

  width = maxWidth;

  // get the line height and the total height
  var lineHeight = parameters.size + parameters.lineSpacing;
  var height = lineHeight * wordsCount;

  // security margin
  canvas.width = width + 20; 
  canvas.height = height + 20;

  // set the font once more to update the context
  context.font = font;
  context.fillStyle = parameters.color;
  context.textAlign = parameters.align;
  context.textBaseline = 'top';

  // draw text
  for (var k = 0; k < wordsCount; k++) {
    var word = words[k];

    var left;

    if (parameters.align === 'left') {
      left = 0;
    } else if (parameters.align === 'center') {
      left = canvas.width / 2;
    } else {
      left = canvas.width;
    }

    context.fillText(word, left, lineHeight * k);  
  }

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    opacity: 0
  });

  var geometry = new THREE.PlaneGeometry(canvas.width / 20, canvas.height / 20);

  // Group is exposed, mesh is animated
  var group = new THREE.Object3D();

  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -20;
  group.add(mesh);

  group.visible = false;

  this.el = group;

  var cache = { y: mesh.position.y, opacity: mesh.material.opacity };

  function update () {
    mesh.position.y = cache.y;
    mesh.material.opacity = cache.opacity;
  }  

  this.in = function () {
    TweenLite.to(cache, 1.5, { y: 0, opacity: 1,
      onStart: function () { group.visible = true; },
      onUpdate: update
    });
  };

  this.out = function (way) {
    var y = way === 'up' ? -20 : 20;
    TweenLite.to(cache, 1, { y: y, opacity: 0,
      onUpdate: update,
      onComplete: function () { group.visible = false; }
    });
  };
}

TextPanel.defaultOptions = {
  size: 100,
  font: 'Futura, Trebuchet MS, Arial, sans-serif',
  style: 'Bold',
  align: 'center',
  lineSpacing: 20,
  color: 'rgba(200, 200, 200, 1)'
};

module.exports = TextPanel;