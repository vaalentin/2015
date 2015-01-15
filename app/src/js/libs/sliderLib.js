'use strict';

var jQuery = require('jquery');

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
  var _this = this;

  var $node = jQuery('<div class="slider__map__node">');
  this.$nodes = jQuery();

  this.$slides.each(function (index) {
    var $slide = jQuery(this);
    
    $slide.css({
      width: _this.slideWidth + '%',
      left: (index * _this.slideWidth) + '%'
    });

    var $nodeCopy = $node.clone();
      
    // first slide/node setup
    if (index === 0) {
      $slide.addClass('is-active');
      $nodeCopy.addClass('is-active');
    }

    _this.$nodes = _this.$nodes.add($nodeCopy);
  });

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

Slider.prototype.next = function () {
  this.current++;

  if (this.current >= this.totalSlides) {
    this.current = 0;
  }

  this.goTo(this.current);
};

Slider.prototype.prev = function () {
  this.current--;

  if (this.current <= 0) {
    this.current = this.totalSlides;
  }

  this.goTo(this.current);
};

Slider.prototype.goTo = function (index) {
  var target = -(index * 100) + '%';

  this.updateMap(index);

  this.$container.stop().animate({ left: target }, 500);

  this.$slides.removeClass('is-active');
  jQuery(this.$slides[index]).addClass('is-active');
};

Slider.prototype.updateMap = function (index) {
  this.$nodes.removeClass('is-active');
  jQuery(this.$nodes[index]).addClass('is-active');
};

Slider.prototype.start = function () {
  // node's click
  this.$nodes.on('click', function () {
    var index = jQuery(this).index();
    _this.goTo(index);
  });

  var _this = this;

  // autoplay with pause on hover
  this.interval = window.setInterval(function () {
    _this.next();
  }, 10000);

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

  // listen for resize
  jQuery(window).on('resize', this.onResize);
  this.onResize();
};

Slider.prototype.stop = function () {
  // unbind listeners
  this.$nodes.off('click');
  this.$el.off('mouseenter mouseleave');
  jQuery(window).off('resize', this.onResize);

  // kill interval
  window.clearInterval(this.interval);
};

module.exports = Slider;