/* jshint laxbreak: true */

'use strict';

var jQuery = require('jquery');

var debounce = require('../utils/debounceUtil');

module.exports = (function ($) {
  /**
   * Trigger event on element when they enter/leave viewport
   *
   * @class waypoint
   * @constructor
   * @param {Object} [options]
   * @param {jQuery} [options.$viewport=jQuery(window)] Viewport
   * @param {Number} [options.offset=0] Offset
   * @param {Number} [options.startAt=null] Start after certain distance (for performances)
   * @requires jQuery, debounce
   */
  $.fn.waypoint = function (options) {
    var isInContainer = options.$viewport ? true : false;

    var parameters = $.extend({
      $viewport: $(window),
      offset: 0,
      startAt: null
    }, options);

    var $els = $(this);
    var $viewport = parameters.$viewport;

    var viewportHeight = $viewport.height();
    var scrollTop = $viewport.scrollTop();
    var threshold = viewportHeight * (parameters.offset / 100);

    // Store height and top on elements to avoid consecutive computations
    function cacheAttributes () {
      $els.each(function () {
        var $el = $(this);

        var height = parseInt($el.outerHeight());
        var top = isInContainer
          ? parseInt($el.position().top) + scrollTop
          : parseInt($el.offset().top);

        $el.attr({ 'data-height': height, 'data-top': top });
      });
    }

    function onResize () {
      /*jshint validthis: true */

      viewportHeight = $viewport.height();
      threshold = viewportHeight * (parameters.offset / 100);

      cacheAttributes();

      $(this).trigger('scroll');
    }

    var onScroll = debounce(function onScroll () {
      scrollTop = $(this).scrollTop();

      if (parameters.startAt && scrollTop < parameters.startAt) {
        return false;
      }

      var topLimit = scrollTop + threshold;
      var bottomLimit = scrollTop + (viewportHeight - threshold);

      $els.each(function () {
        var $el = $(this);

        var state = $el.attr('data-state');

        var height = parseInt($el.attr('data-height')) || $el.outerHeight();
        var top = isInContainer
          ? parseInt($el.attr('data-top')) + 1 || $el.position().top + 1
          : parseInt($el.attr('data-top')) + 1 || $el.offset().top + 1;
        var bottom = top + height;

        if (top > topLimit && top < bottomLimit
            || bottom > topLimit && bottom < bottomLimit
            || top < topLimit && bottom > bottomLimit) {

          if (!state) {
            $el.attr('data-state', 'visible');
            $el.trigger('active');
            $el.trigger('stateChange', 'active');
          }
        } else {
          if (state) {
            $el.attr('data-state', null);
            $el.trigger('inactive');
            $el.trigger('stateChange', 'inactive');
          }
        }

      });
    }, 20);

    return {
      /**
       * Start waypoint
       *
       * @method start
       */
      start: function () {
        $(window).on('resize', onResize);
        $viewport.on('scroll', onScroll);
        cacheAttributes();
        onScroll();
      },

      /**
       * Stop waypoint
       *
       * @method stop
       */
      stop: function () {
        $(window).off('resize', onResize);
        $viewport.off('scroll', onScroll);
      }
    };
  };

})(jQuery);