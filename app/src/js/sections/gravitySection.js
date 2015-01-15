'use strict';

var Section = require('../classes/SectionClass');

var GravityGrid = require('../objects3D/GravityGridObject3D');

var gravitySection = new Section('gravity');

var grid = new GravityGrid({
  linesColor: '#666666'
});
grid.el.position.z = 0;
grid.el.rotation.x = -1;
gravitySection.add(grid.el);

grid.el.visible = false;

gravitySection.onIn(function () {
  grid.in();
});

gravitySection.onOut(function () {
  grid.out();
});

gravitySection.onStart(function () {
  grid.start();
});

gravitySection.onStop(function () {
  grid.stop();
});

gravitySection.show = function () {
  grid.el.visible = true;
};

gravitySection.hide = function () {
  grid.el.visible = false;
};

module.exports = gravitySection;