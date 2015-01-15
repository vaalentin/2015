'use strict';

var THREE = require('three');

/**
 * Section class
 * 
 * @class Section
 * @constructor
 * @param {String} [name]
 * @requires THREE, Events
 */
function Section (name) {
  this.name = name;
  this.playing = false;

  var fn = function () {};
  this._in = fn;
  this._out = fn;
  this._start = fn;
  this._stop = fn;

  this.el = new THREE.Object3D();
}

/**
 * Add a new object
 *
 * @method add
 * @param {THREE.Object3D} [object]
 */
Section.prototype.add = function (object) {
  this.el.add(object);
};

/**
 * @method in
 */
Section.prototype.in = function (way) {
  this._in(way);
};

/**
 * @method out
 * @param {Number} [way]
 */
Section.prototype.out = function (way) {
  this._out(way);
};

/**
 * @method start
 */
Section.prototype.start = function () {
  if (this.playing) {
    return false;
  }

  this._start();

  this.playing = true;
};

/**
 * @method stop
 */
Section.prototype.stop = function () {
  if (!this.playing) {
    return false;
  }

  this._stop();

  this.playing = false;
};

/**
 * @method onIn
 * @param {Function} [callback]
 */
Section.prototype.onIn = function (callback) {
  this._in = callback;
};

/**
 * @method onOut
 * @param {Function} [callback]
 */
Section.prototype.onOut = function (callback) {
  this._out = callback;
};

/**
 * @method onStart
 * @param {Function} [callback]
 */
Section.prototype.onStart = function (callback) {
  this._start = callback;
};

/**
 * @method onStop
 * @param {Function} [callback]
 */
Section.prototype.onStop = function (callback) {
  this._stop = callback;
};

module.exports = Section;