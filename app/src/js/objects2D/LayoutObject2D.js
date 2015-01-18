'use strict';

var jQuery = require('jquery');

/**
 * Animated layout
 *
 * @class Layout
 * @constructor
 * @requires jQuery
 */
function Layout ($el) {
  this.$el = $el;

  this.$container = this.$el.find('.layout__parts');
  this.$mouse = this.$el.find('.layout__mouse');
  this.$click = this.$mouse.find('.layout__mouse__click');

  // targets
  this.y = 0;
  this.openY = -15;
  this.mouseY = 90;

  this.interval = null;
}

/**
 * Animation next step
 *
 * @method slide
 */
Layout.prototype.slide = function () {
  // update targets
  if (this.y === 0) {
    this.y = -100;
    this.openY = -15;
    this.mouseY = 83;
  } else {
    this.y = 0;
    this.openY = -85;
    this.mouseY = 3;
  }

  var _this = this;

  function moveMouse () {
    var flag = false;

    _this.$mouse.animate({
      'top': _this.mouseY + '%'
    }, {
      duration: 500,
      progress: function (animation, progress) {
        if (!flag && progress > 0.5) {
          flag = !flag;
          open();
        }
      }
    });
  }

  function open () {
    _this.$container.animate({
      'top': _this.openY + '%'
    }, 800, function () {
      click();
    });
  }

  function click () {
    var flag = false;

    _this.$click.delay(500).animate({
      'width': 70,
      'height': 70,
      'margin-left': -35,
      'margin-top': -35,
      'opacity': 0
    }, {
      duration: 400,
      progress: function (animation, progress) {
        if (!flag && progress > 0.7) {
          flag = !flag;
          slide();
        }
      },
      complete: function () {
        _this.$click.css({
          'width': 0,
          'height': 0,
          'margin-left': 0,
          'margin-top': 0,
          'opacity': 1
        });
      }
    });
  }

  function slide () {
    _this.$container.animate({
      'top': _this.y + '%'
    }, 500);

    centerMouse();
  }

  function centerMouse () {
    _this.$mouse.delay(300).animate({
      'top': '45%'
    }, 500);
  }

  moveMouse();
};

/**
 * Start animation
 *
 * @method start
 */
Layout.prototype.start = function () {
  var _this = this;

  _this.slide();

  this.interval = window.setInterval(function () {
    _this.slide();
  }, 4000);
};

/**
 * Stop animation
 *
 * @method stop
 */
Layout.prototype.stop = function () {
  window.clearInterval(this.interval);
};

module.exports = Layout;