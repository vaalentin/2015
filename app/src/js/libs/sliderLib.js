'use strict';

var jQuery = require('jquery');

/**
 * Slider
 *
 * @class Slider
 * @constructor
 * @requires jQuery
 */
function Slider ($el) {
  this.$el = $el;

  // els
  this.$container = this.$el.find('.slider__slides');
  this.$slides = this.$container.find('.slider__slide');
  this.$map = this.$el.find('.slider__map');

  // vars
  this.totalSlides = this.$slides.length;
  this.slideWidth = 100 / this.totalSlides;
  this.current = 0;
  this.interval = null;

  // init container
  this.$container.css('width', (this.totalSlides * 100) + '%');

  // methods
  this.onResize = null;

  // init slides and map
  var $node = jQuery('<div class="slider__map__node">');
  this.$nodes = jQuery();

  this.$slides.each(function (index, el) {
    var $slide = jQuery(el);
    
    $slide.css({
      width: this.slideWidth + '%',
      left: (index * this.slideWidth) + '%'
    });

    var $nodeCopy = $node.clone();
      
    // first slide/node setup
    if (index === 0) {
      $slide.addClass('is-active');
      $nodeCopy.addClass('is-active');
    }

    this.$nodes = this.$nodes.add($nodeCopy);
  }.bind(this));

  this.$map.html(this.$nodes);

  // init resize method
  this.onResize = function () {
    var maxHeight = 0;

    this.$slides.each(function () {
      var height = jQuery(this).height();

      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    maxHeight += 10;

    this.$el.css({ height: maxHeight, marginTop: -(maxHeight / 2) });
  }.bind(this);

  this.onResize();
}

/**
 * Go to next slide
 *
 * @method next
 */
Slider.prototype.next = function () {
  this.current++;

  if (this.current >= this.totalSlides) {
    this.current = 0;
  }

  this.goTo(this.current);
};

/**
 * Go to previous slide
 *
 * @method prev
 */
Slider.prototype.prev = function () {
  this.current--;

  if (this.current <= 0) {
    this.current = this.totalSlides;
  }

  this.goTo(this.current);
};

/**
 * Go to a specific slide
 *
 * @method goTo
 * @param {Number} [index] Slide's index
 */
Slider.prototype.goTo = function (index) {
  var target = -(index * 100) + '%';

  this.updateMap(index);

  this.$container.stop().animate({ left: target }, 500);

  this.$slides.removeClass('is-active');
  jQuery(this.$slides[index]).addClass('is-active');
};

/**
 * Update control nodes
 *
 * @method updateMap
 * @param {Number} [index] Current index
 */
Slider.prototype.updateMap = function (index) {
  this.$nodes.removeClass('is-active');
  jQuery(this.$nodes[index]).addClass('is-active');
};

/**
 * Start the slider
 *
 * @method start
 */
Slider.prototype.start = function () {
  this.$nodes.on('click', function (e) {
    var index = jQuery(e.currentTarget).index();
    this.goTo(index);
  }.bind(this));

  // autoplay with pause on hover
  this.interval = window.setInterval(function () {
    this.next();
  }.bind(this), 10000);

  var _this = this;
  
  this.$el.on({
    mouseenter: function () {
      window.clearInterval(_this.interval);
    },
    mouseleave: function () {
      _this.interval = window.setInterval(function () {
        _this.next();
      }, 10000);
    }
  });

  jQuery(window).on('resize', this.onResize);
  this.onResize();
};

/**
 * Stop the slider
 *
 * @method next
 */
Slider.prototype.stop = function () {
  this.$nodes.off('click');
  this.$el.off('mouseenter mouseleave');
  jQuery(window).off('resize', this.onResize);

  window.clearInterval(this.interval);
};

module.exports = Slider;