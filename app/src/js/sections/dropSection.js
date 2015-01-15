'use strict';

var Section = require('../classes/SectionClass');

var TextPanel = require('../objects3D/TextPanelObject3D');
var Drop = require('../objects3D/DropObject3D');

var dropSection = new Section('drop');

var drop = new Drop({ amplitude: 4 });
drop.el.rotation.x = -1.2;
drop.el.position.y = -10;
dropSection.add(drop.el);

var text = new TextPanel(
  'F  R  O  M \n A N   I D E A',
  {
    align: 'right',
    style: '',
    size: 50,
    lineSpacing: 40
  }
);
text.el.position.set(-10, 8, 0);
dropSection.add(text.el);

drop.el.visible = false;

dropSection.onIn(function () {
  drop.in();
  text.in();
});

dropSection.onOut(function (way) {
  drop.out(way);
  text.out(way);
});

dropSection.onStart(function () {
  drop.start();

  drop.el.visible = true;
});

dropSection.onStop(function () {
  drop.stop();

  drop.el.visible = false;
});

module.exports = dropSection;