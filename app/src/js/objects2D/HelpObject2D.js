'use strict';

var jQuery = require('jquery');

var Slider = require('../libs/sliderLib');

var Layout = require('../objects2D/LayoutObject2D');
var Mouse = require('../objects2D/MouseObject2D');
var Keys = require('../objects2D/KeysObject2D');

/**
 * Help overlay
 *
 * @class Help
 * @constructor
 * @requires jQuery, Sider, Layout, Mouse, Keys
 */
function Help () {
  this.$el = jQuery('.help');
  this.slider = new Slider(this.$el.find('.slider'));

  this.keys = new Keys(this.$el.find('.keys'));
  this.mouse = new Mouse(this.$el.find('.mouse'));
  this.layout = new Layout(this.$el.find('.layout'));
}

/**
 * In animation
 *
 * @method in
 */
Help.prototype.in = function () {
  this.$el.css({ display: 'block', opacity: 0 });

  this.slider.start();

  this.slider.$el.delay(100).css({ top: '60%', opacity: 0 })
    .animate({ top: '50%', opacity: 1 }, 500);

  this.$el.stop().animate({ opacity: 0.9 }, 500, function () {
    this.keys.start();
    this.mouse.start();
    this.layout.start();
  }.bind(this));

  this.$el.on('click', function (event) {
    if (event.target === this) {
      this.out();
    }
  }.bind(this));

  this.$el.find('.help__quit').on('click', function () {
    this.out();
  }.bind(this));
};

/**
 * Out animation
 *
 * @method out
 */
Help.prototype.out = function () {
  this.$el.stop().animate({ opacity: 0 }, 500, function () {
    this.$el.css('display', 'none');

    this.slider.stop();

    this.keys.stop();
    this.mouse.stop();
    this.layout.stop();
  }.bind(this));

  this.$el.off('click');
  this.$el.find('.help__quit').off('click');
};

module.exports = Help;