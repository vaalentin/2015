'use strict';
  
var Section = require('../classes/SectionClass');

var TextPanel = require('../objects3D/TextPanelObject3D');
var LookAtField = require('../objects3D/LookAtFieldObject3D');

var endSection = new Section('end');

var text = new TextPanel(
  'T  H  A  N  K  S \n F  O  R    W  A  T  C  H  I  N  G',
  {
    align: 'center',
    style: '',
    size: 50,
    lineSpacing: 40
  }
);
endSection.add(text.el);

var field = new LookAtField({
  count: 50
});
endSection.add(field.el);

endSection.onIn(function () {
  text.in();
  field.in();
});

endSection.onOut(function (way) {
  text.out(way);
  field.out(way);
});

module.exports = endSection;