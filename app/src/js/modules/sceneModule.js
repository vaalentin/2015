'use strict';

var jQuery = require('jquery');
var THREE = require('three');
var TweenLite = require('tweenlite');

var SPRITE3D = require('../libs/sprite3DLib');

var SOUNDS = require('../modules/soundsModule');

var Events = require('../classes/EventsClass');

var MapObj = require('../objects2D/MapObject2D');

var BackgroundParticles = require('../objects3D/BackgroundParticlesObject3D');
var BackgroundLines = require('../objects3D/BackgroundLinesObject3D');

/**
 * 3D Scene
 *
 * @module SCENE
 * @event [section:changeBegin]
 * @event [section:changeComplete]
 * @requires jQuery, THREE, TweenLite, SPRITE3D, SOUNDS, Events, MapObj, BackgroundParticles, BackgroundLines
 */
var SCENE = (function () {
  var instance;

  function init () {
    // params
    var parameters = {
      fogColor: '#0a0a0a',
      quality: 1,
      sectionHeight: 50
    };

    // DOM element
    var $viewport;
    var width;
    var height;

    // THREE Scene
    var resolution;
    var renderer;
    var scene;
    var light;
    var camera;
    var frameId;
    var cameraShakeY = 0;

    // mouse
    var mouseX = 0;

    // general
    var isLocked = false; // used to prevent additional event when slide() called from outside
    var isActive;
    var isStarted = false;

    // camera
    var cameraCache = { speed: 0 };
    var isScrolling = false;

    // background lines
    var backgroundLines;

    // sections
    var sections = [];
    var sectionsMap = {}; // map name with index
    var totalSections;
    var currentIndex = 0;
    var previousIndex = 0;
    
    // events
    var events = new Events();

    function navigation () {
      function next () {
        if (currentIndex === totalSections) {
          if (!isLocked) {
            events.trigger('end');  
          }
          
          return false;
        }

        currentIndex++;

        animateCamera(currentIndex);
      }

      function prev () {
        if (currentIndex === 0) {
          return false;
        }

        currentIndex--;

        animateCamera(currentIndex);
      }

      // scroll
      var newDate;
      var oldDate = new Date();
      
      function onScroll (event) {
        newDate = new Date();

        var elapsed = newDate.getTime() - oldDate.getTime();

        // handle scroll smoothing (mac trackpad for instance)
        if (elapsed > 50 && !isScrolling) {
          if (event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0) {
            next();
          } else {
            prev();
          }
        }

        oldDate = new Date();

        return false;
      }

      function onKeyDown (event) {
        if (!isScrolling && isActive) {
          var keyCode = event.keyCode;
          
          if (keyCode === 40) {
            next();
          } else if (keyCode === 38) {
            prev();
          }
        }
      }

      $viewport.on('DOMMouseScroll mousewheel', onScroll);
      jQuery(document).on('keydown', onKeyDown);
    }

    function setup () {
      if (!$viewport) {
        console.warn('set viewport first');
        return false;
      }

      resolution = parameters.quality;

      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: false
      });
      // for transparent bg, also set alpha: true
      // renderer.setClearColor(0x000000, 0);
      renderer.setClearColor('#0a0a0a', 1);
      renderer.setSize(width * resolution, height * resolution);
      $viewport.append(renderer.domElement);

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(parameters.fogColor, 0.01);

      light = new THREE.DirectionalLight('#ffffff', 0.5);
      light.position.set(0.2, 1, 0.5);
      scene.add(light);

      camera = new THREE.PerspectiveCamera(20, width / height, 1, 4000);
      camera.position.set(0, 0, 40);

      function onMouseMove (event) {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      }

      jQuery(window).on('resize', onResize);
      $viewport.on('mousemove', onMouseMove);

      navigation();
      draw();

      return SCENE.getInstance();
    }

    function setupBackground () {
      // add background particles and lines
      // rangeY based on the size and the number of sections
      var rangeY = [
        parameters.sectionHeight,
        (-sections.length * parameters.sectionHeight) - parameters.sectionHeight
      ];

      var backgroundParticles = new BackgroundParticles({ rangeY: rangeY, count: 1000 });
      scene.add(backgroundParticles.el);

      backgroundLines = new BackgroundLines({ rangeY: rangeY, count: 200 });
      scene.add(backgroundLines.el);
    }

    function draw () {
      SPRITE3D.update();
      render();
      frameId = window.requestAnimationFrame(draw);
    }

    function render () {
      // camera noise
      camera.position.y += Math.cos(cameraShakeY) / 50;
      cameraShakeY += 0.02;

      // mouse camera move
      camera.position.x += ((mouseX * 5) - camera.position.x) * 0.03;

      renderer.render(scene, camera);
    }

    function onResize () {
      width = $viewport.width();
      height = $viewport.height();

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width * resolution, height * resolution);
    }

    function animateCamera (index) {
      // in case goTo is called
      // otherwise navigation set currentIndex
      currentIndex = index;

      var nextPosition = index * -parameters.sectionHeight;
      
      // which way are we animating?
      var way = index < previousIndex ? -1 : 1;

      // event's data
      var data = {
        from: {
          name: sectionsMap[previousIndex],
          index: previousIndex
        },
        to: {
          name: sectionsMap[index],
          index: index
        },
        way: way === -1 ? 'up' : 'down'
      };

      TweenLite.to(camera.position, 1.5, { y: nextPosition, ease: window.Quart.easeInOut,
        onStart: function () {
          isScrolling = true;
          SOUNDS.wind.play();
          events.trigger('section:changeBegin', data);
        },
        onComplete: function () {
          if (previousIndex === index) {
            return false;
          }

          isScrolling = false;
          events.trigger('section:changeComplete', data);
          previousIndex = index;
        }
      });

      TweenLite.to(cameraCache, 1.5, {
        bezier: { type: 'soft', values: [{ speed: 10 }, { speed: 0 }] },
        onUpdate: function () {
          backgroundLines.updateY(this.target.speed);
        }
      });
    }

    return {
      /**
       * Set the SCENE viewport
       *
       * @method setViewport
       * @param {jQuery} [$el] $viewport DOM element
       */
      setViewport: function ($el) {
        $viewport = $el;

        width = $viewport.width();
        height = $viewport.height();

        setup();
      },

      /**
       * Set config
       *
       * @method config
       * @param {Object} [options]
       * @param {String} [options.fogColor='#0a0a0a'] Fog color
       * @param {Number} [options.quality=1] Quality
       * @param {Number} [options.sectionHeight=50] Height of each section
       * @param {Boolean} [screenshot=false] If set on true, press P to output imgData to the console
       */
      config: function (options) {
        parameters = jQuery.extend(parameters, options);
      },

      /**
       * Add sections
       *
       * @method addSections
       * @param {Array} [sections] Array of Sections
       */
      addSections: function (_sections) {
        sections = _sections;
        totalSections = sections.length - 1;

        for (var i = 0, j = sections.length; i < j; i++) {
          var section = sections[i];

          sectionsMap[i] = section.name;

          section.el.position.y = i * -parameters.sectionHeight;
          scene.add(section.el);
        }

        setupBackground();
      },

      /**
       * Listen to SCENE event bus
       *
       * @method on
       * @param {String} [event]
       * @param {Function} [callback]
       **/
      on: function () {
        events.on.apply(events, arguments);
      },

      /**
       * Animate camera to section
       *
       * @method goTo
       * @param {Number} [index] Section's index
       */
      goTo: function (index) {
        if (index === currentIndex) {
          return false;
        }

        animateCamera(index);
      },

      /**
       * Get SCENE map
       *
       * @method getMap
       * @return {Map}
       */
      getMap: function () {

        var map = new MapObj();

        for (var i = 0, j = sections.length; i < j; i++) {
          map.addNode(i);
        }

        return map;
      },

      /**
       * Start drawing loop
       *
       * @method stop
       */
      start: function () {
        isActive = true;

        if (!isStarted) {
          // first event
          var data = {
            from: {
              name: sectionsMap[previousIndex],
              index: previousIndex
            },
            to: {
              name: sectionsMap[currentIndex],
              index: currentIndex
            },
            way: 'down'
          };

          events.trigger('section:changeBegin', data);

          isStarted = true;
        }

        if (!frameId) {
          draw();
        }
      },

      /**
       * Stop drawing loop
       *
       * @method stop
       */
      stop: function () {
        if (frameId) {
          window.cancelAnimationFrame(frameId);
          frameId = undefined;
          isActive = false;
        }
      },

      /**
       * Set scene quality
       *
       * @method quality
       * @param {Number} [ratio]
       */
      quality: function (value) {
        resolution = value;
        renderer.setSize(width * resolution, height * resolution);
      },

      /**
       * Return current scene quality
       *
       * @method getQuality
       * @return {Number}
       */
      getQuality: function () {
        return resolution;
      },

      /**
       * Lock scene (forbid triggering end event)
       *
       * @method lock
       */
      lock: function () {
        isLocked = true;
      },

      /**
       * Unlock scene (allow triggering end event)
       *
       * @method unlock
       */
      unlock: function () {
        isLocked = false;
      },

      /**
       * in animation
       *
       * @method in
       */
      in: function () {
        TweenLite.to({ fov: 200, speed: 0 }, 2, {
          bezier: { type: 'soft', values: [{ speed: 20 }, { speed: 0 }]},
          fov: 60,
          ease: 'easeOutCubic',
          onUpdate: function () {
            backgroundLines.updateZ(this.target.speed);
            camera.fov = this.target.fov;
            camera.updateProjectionMatrix();
          }
        });
      }
    };
  }

  return {
    /**
     * Return SCENE instance
     *
     * @method getInstance
     * @return {SCENE}
     */
    getInstance: function () {
      if (!instance) {
        instance = init();
      }

      return instance;
    }
  };
})();

module.exports = SCENE.getInstance();