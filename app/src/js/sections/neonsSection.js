'use strict';

var Section = require('../classes/SectionClass');

var Smoke = require('../objects3D/SmokeObject3D');
var Neon = require('../objects3D/NeonObject3D');

var neonsSection = new Section('neons');

var smoke = new Smoke({
  planesNumber: 3,
  frontColor: '#4c4c4c',
  backColor: '#ffffff',
  data: [
    { positionX : -2.5, positionY: -18.8, positionZ: -6, rotationZ: 2.7, scale: 8.5 },
    { positionX : -11.1, positionY: 10.3, positionZ: -10.4, rotationZ: 1.4, scale: 5.8 },
    { positionX : -15.1, positionY: -5.9, positionZ: -19.2, rotationZ: 1.6, scale: 7.4 }
  ]
});
neonsSection.add(smoke.el);

var neonA = new Neon();

var neonB = new Neon();
neonB.el.position.set(0, 0, 0);
neonB.el.rotation.z = 2;

var neonC = new Neon();
neonC.el.position.set(0, 13, 0);
neonC.el.rotation.z = 2;

var neonD = new Neon();
neonD.el.position.set(0, -13, 0);
neonD.el.rotation.z = 2;

neonsSection.add(neonA.el);
neonsSection.add(neonB.el);
neonsSection.add(neonC.el);
neonsSection.add(neonD.el);

neonA.el.visible = false;
neonB.el.visible = false;
neonC.el.visible = false;
neonD.el.visible = false;
smoke.el.visible = false;

neonsSection.onStart(function () {
  neonA.start();
  neonB.start();
  neonC.start();
  neonD.start();

  neonA.el.visible = true;
  neonB.el.visible = true;
  neonC.el.visible = true;
  neonD.el.visible = true;
});

neonsSection.onStop(function () {
  neonA.stop();
  neonB.stop();
  neonC.stop();
  neonD.stop();

  neonA.el.visible = false;
  neonB.el.visible = false;
  neonC.el.visible = false;
  neonD.el.visible = false;
});

var smokePlaying = false;

neonsSection.smokeStart = function () {
  if (smokePlaying) {
    return false;
  }

  smokePlaying = true;

  smoke.start();

  smoke.el.visible = true;
};

neonsSection.smokeStop = function () {
  if (!smokePlaying) {
    return false;
  }

  smokePlaying = false;

  smoke.stop();

  smoke.el.visible = false;
};

module.exports = neonsSection;