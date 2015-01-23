'use strict';

var jQuery = require('jquery');

var Events = require('../classes/EventsClass');

/**
 * Handle navigation between heads/tails
 *
 * @module APP
 * @event [heads:visible] Heads is at least partially in the viewport
 * @event [heads:invisible] Heads is completely out of the viewport
 * @requires jQuery, Events
 */
var APP = (function () {
  var instance;

  function init () {
    var events = new Events();

    var $trigger = jQuery('.trigger');
    var $heads = jQuery('.heads');
    var $tails = jQuery('.tails');
    var $infoArrow = $heads.find('.trigger__info--arrow');
    var $infoHeads = $heads.find('.trigger__info--heads');
    var $infoTails = $heads.find('.trigger__info--tails');

    // reset scroll
    jQuery('body').stop().animate({ scrollTop: 0 }, 2000);

    function navigation () {

      var isOpen = false;
      var isSliding = false;

      // Update the location of the trigger area
      function updateTrigger () {
        var properties;

        if (isOpen) {
          properties = { top: 0, bottom: 'auto' };
        } else {
          properties = { top: 'auto', bottom: 0 };
        }

        $trigger.css(properties);
      }

      function open () {
        if (isSliding) {
          return false;
        }

        var to;
        var y;

        if (isOpen) {
          to = 'heads';
          y = -90;
          events.trigger('heads:visible');
        } else {
          to = 'tails';
          y = -10;
          $infoArrow.stop().animate({ opacity: 0, bottom: 20 }, 500);
        }

        var props = { y: y + '%' };

        $heads.stop().animate(props, { duration: 400, easing: 'swing' });
        $tails.stop().animate(props, { duration: 400, easing: 'swing' });
      }

      function close () {
        if (isSliding) {
          return false;
        }

        var to;
        var y;

        if (isOpen) {
          to = 'heads';
          y = -100;
        } else {
          to = 'tails';
          y = 0;
          $infoArrow.stop().animate({ opacity: 0.5, bottom: 0 }, 500);
        }

        var props = { y: y + '%' };

        function onComplete () {
          if (to === 'heads') {
            events.trigger('heads:invisible');
          }
        }
        
        $heads.stop().animate(props, { duration: 400, easing: 'swing' });
        $tails.stop().animate(props, { duration: 400, easing: 'swing', complete: onComplete });
      }

      // Slide between heads and tails 
      function slide (callback) {
        isSliding = true;

        var to;
        var y;
        var durations;

        if (isOpen) {
          to = 'heads';
          y = 0;
          durations = [1050, 1000];
          events.trigger('heads:visible');
          $infoHeads.animate({ opacity: 0 }, 800);
          $infoArrow.stop().animate({ opacity: 0.5, bottom: 0 }, 500);
        } else {
          to = 'tails';
          y = -100;
          durations = [1000, 1050];
          $infoTails.animate({ opacity: 0 }, 800);
        }

        events.trigger('slideBegin', { to: to });

        var props = { y: y + '%' };

        function onComplete () {
          isSliding = false;

          events.trigger('slideComplete', { to: to });

          if (to === 'tails') {
            events.trigger('heads:invisible');

            $infoHeads.css('opacity', 1);
          } else {
            $infoTails.css('opacity', 1);
          }

          if (callback) {
            callback();
          }
        }

        $heads.stop().animate(props, { duration: durations[0], easing: 'easeInOutCubic' });
        $tails.stop().animate(props, { duration: durations[1], easing: 'easeInOutCubic', complete: onComplete });

        isOpen = !isOpen;

        updateTrigger();
      }

      $trigger.on({
        mouseenter: function () {
          open();
        },
        mouseleave: function () {
          close();
        },
        click: function () {
          slide();
        }
      });

      events.on('endSlide', function () {
        slide(this);
      });

      $infoHeads.css('opacity', 0);
    }

    function setup () {
      navigation();
      return APP.getInstance();
    }

    return {
      /**
       * Start APP
       *
       * @method start
       */
      start: setup,

      /**
       * Listen to APP event bus
       *
       * @method on
       * @param {String} [event]
       * @param {Function} [callback]
       **/
      on: function () {
        events.on.apply(events, arguments);
      },

      /**
       * Trigger slide on APP event bus
       * 
       * @method slide
       **/
      slide: function (callback) {
        events.trigger('endSlide', callback);
      }
    };
  }

  return {
    /**
     * Return APP instance
     *
     * @method getInstance
     * @return {APP}
     */
    getInstance: function () {
      if (!instance) {
        instance = init();
      }

      return instance;
    }
  };
})();

module.exports = APP.getInstance();