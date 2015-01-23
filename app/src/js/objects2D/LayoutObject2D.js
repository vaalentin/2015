'use strict';

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

  var open = function () {
    this.$container.animate({
      'top': this.openY + '%'
    }, 800, function () {
      click();
    });
  }.bind(this);

  var moveMouse = function () {
    var flag = false;

    this.$mouse.animate({
      'top': this.mouseY + '%'
    }, {
      duration: 500,
      progress: function (animation, progress) {
        if (!flag && progress > 0.5) {
          flag = !flag;
          open();
        }
      }
    });
  }.bind(this);

  var click = function () {
    var flag = false;

    this.$click.delay(500).animate({
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
        this.$click.css({
          'width': 0,
          'height': 0,
          'margin-left': 0,
          'margin-top': 0,
          'opacity': 1
        }.bind(this));
      }
    });
  }.bind(this);

  var slide = function () {
    this.$container.animate({
      'top': this.y + '%'
    }, 500);

    centerMouse();
  }.bind(this);

  var centerMouse = function () {
    this.$mouse.delay(300).animate({
      'top': '45%'
    }, 500);
  }.bind(this);

  moveMouse();
};

/**
 * Start animation
 *
 * @method start
 */
Layout.prototype.start = function () {
  this.slide();

  this.interval = window.setInterval(function () {
    this.slide();
  }.bind(this), 4000);
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