'use strict';

/**
 * Preload images. Notify on update/complete
 *
 * @class ImagesLoader
 * @constructor
 * @param {Array} [images=[]] Images sources
 */
function ImagesLoader (images) {
  this.images = images || [];
  this.total = this.images.length;

  var fn = function () {};
  this.progress = fn;
  this.complete = fn;
}

/**
 * Start to preload
 *
 * @method start
 */
ImagesLoader.prototype.start = function () {
  var loaded = 0;

  var updateQueue = function () {
    loaded++;

    var percent = (loaded * 100) / this.total;
    this.progress(percent);

    if (loaded === this.total) {
      this.complete();
    }
  }.bind(this);

  for (var i = 0; i < this.total; i++) {
    var image = new Image();
    image.src = this.images[i];
    image.onload = image.onerror = updateQueue;
  }
};

/**
 * Pass the update handler
 *
 * @method onProgress
 * @param {Function} [progress] 
 */
ImagesLoader.prototype.onProgress = function (progress) {
  this.progress = progress;
};

/**
 * Pass the complete handler
 *
 * @method onComplete
 * @param {Function} [complete] 
 */
ImagesLoader.prototype.onComplete = function (complete) {
  this.complete = complete;
};

module.exports = ImagesLoader;