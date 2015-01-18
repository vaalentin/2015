'use strict';

var Section = require('../classes/SectionClass');

var TextPanel = require('../objects3D/TextPanelObject3D');
var Wave = require('../objects3D/WaveObject3D');

var waveSection = new Section('wave');

var wave = new Wave();
waveSection.add(wave.el);

var text = new TextPanel(
  'E  Y  E  S    O  N    T  H  E \n H  O  R  I  Z  O  N',
  {
    align: 'center',
    style: '',
    size: 50,
    lineSpacing: 40
  }
);
text.el.position.y = 10;
text.el.rotation.x = 0.2;
waveSection.add(text.el);

wave.el.visible = false;

waveSection.onIn(function (way) {
  text.in();
  wave.in(way);
});

waveSection.onOut(function (way) {
  text.out(way);
  wave.out(way);
});

waveSection.onStart(function () {
  wave.start();

  wave.el.visible = true;
});

waveSection.onStop(function () {
  wave.stop();

  wave.el.visible = false;
});

module.exports = waveSection;