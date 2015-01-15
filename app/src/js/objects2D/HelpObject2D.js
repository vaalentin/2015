'use strict';

var jQuery = require('jquery');

var Slider = require('../libs/sliderLib');

var Layout = require('../objects2D/LayoutObject2D');
var Mouse = require('../objects2D/MouseObject2D');
var Keys = require('../objects2D/KeysObject2D');

function Help () {
  this.$el = jQuery('.help');
  this.slider = new Slider(this.$el.find('.slider'));

  this.keys = new Keys(this.$el.find('.keys'));
  this.mouse = new Mouse(this.$el.find('.mouse'));
  this.layout = new Layout(this.$el.find('.layout'));
}

Help.prototype.in = function () {
  var _this = this;

  this.$el.css({ display: 'block', opacity: 0 });

  this.slider.start();

  this.slider.$el.delay(100).css({ top: '60%', opacity: 0 })
    .animate({ top: '50%', opacity: 1 }, 500);

  this.$el.stop().animate({ opacity: 0.9 }, 500, function () {
    _this.keys.start();
    _this.mouse.start();
    _this.layout.start();
  });

  this.$el.on('click', function (event) {
    if (event.target === this) {
      _this.out();
    }
  });

  this.$el.find('.help__quit').on('click', function () {
    _this.out();
  });
};

Help.prototype.out = function () {
  var _this = this;

  this.$el.stop().animate({ opacity: 0 }, 500, function () {
    _this.$el.css('display', 'none');

    _this.slider.stop();

    _this.keys.stop();
    _this.mouse.stop();
    _this.layout.stop();
  });

  this.$el.off('click');
  this.$el.find('.help__quit').off('click');
};

module.exports = Help;