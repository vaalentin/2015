'use strict';

function ImagesLoader (images) {
  this.images = images || [];
  this.total = this.images.length;
  this.progress = function () {};
  this.complete = function () {};
}

ImagesLoader.prototype.start = function () {
  var _this = this;

  var loaded = 0;

  function updateQueue () {
    loaded++;

    var percent = (loaded * 100) / _this.total;
    _this.progress(percent);

    if (loaded === _this.total) {
      _this.complete();
    }
  }

  for (var i = 0; i < this.total; i++) {
    var image = new Image();
    image.src = this.images[i];
    image.onload = image.onerror = updateQueue;
  }
};

ImagesLoader.prototype.onProgress = function (progress) {
  this.progress = progress;
};

ImagesLoader.prototype.onComplete = function (complete) {
  this.complete = complete;
};

module.exports = ImagesLoader;