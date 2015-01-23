/* jshint laxbreak: true */

'use strict';

require('./polyfills/animFramePolyfill');
require('./polyfills/bindPolyfill');
require('./polyfills/indexOfPolyfill');

var jQuery = require('jquery');
var skrollr = require('skrollr');
require('./libs/waypointLib');
  
var HASH = require('./modules/hashModule');

var ImagesLoader = require('./classes/LoaderClass');

var Loader = require('./objects2D/LoaderObject2D');
var Menu = require('./objects2D/menuObject2D');
var Wireframe = require('./objects2D/WireframeObject2D');

function mobile () {
  return navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i);
}

jQuery(function () {
  HASH.replacePlaceholders();

  var loader = new Loader();
  var menu = new Menu();
  var imagesLoader = new ImagesLoader([
    './app/public/img/part-beam.png',
    './app/public/img/part-drop.png',
    './app/public/img/part-sphere.png',
    './app/public/img/part-grid.png',
    './app/public/img/part-field.png',
    './app/public/img/part-stars.png'
  ]);

  imagesLoader.onProgress(function (percent) {
    loader.update(percent);
  });

  imagesLoader.start();

  // heads
  skrollr.init({ skrollrBody: 'mobile-body' });

  // tails
  var wireframe = new Wireframe(jQuery('.wireframe'));

  if (!mobile()) {
    var $tails = jQuery('.tails');
    var $tailsSections = $tails.find('.tails__section');

    // prepare els
    $tailsSections.find('.tails__section__el').animate({ opacity: 0, y: 100 }, 0);

    var waypoint = $tailsSections.waypoint({
      offset: 30,
      startAt: $tails.offset().top - 1000
    });

    waypoint.start();

    $tailsSections.on('active', function () {
      var $el = jQuery(this);
      
      if ($el.attr('data-appeared')) {
        return false;
      }

      jQuery(this).find('.tails__section__el').each(function (i) {
        jQuery(this).stop().delay(i * 100).animate({ opacity: 1, y: 0 }, 500);
      });

      $el.attr('data-appeared', true);
    });

    jQuery('.tails__section--site').on('stateChange', function (e, state) {
      if (state === 'active') {
        wireframe.start();
        wireframe.in();
      } else {
        wireframe.stop();
      }
    });
  } else {
    wireframe.in();
  }

  imagesLoader.onComplete(function () {
    loader.out();

    setTimeout(function () {
      menu.in();
    }, 1500);
  });
});