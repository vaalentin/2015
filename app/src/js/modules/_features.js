'use strict';

function css (feature) {
  var prefixes = 'Webkit Moz ms O'.split(' ');
  var element = document.createElement('div');

  // first test
  if (element.style[feature] !== undefined) {
    return true;
  }

  // with prefixes
  var featureCapital = feature.charAt(0).toUpperCase() + feature.substr(1);
  for (var i = 0, j = prefixes.length; i < j; i++) {
    if (element.style[prefixes[i] + featureCapital] !== undefined) {
      return true;
    }
  }

  return false;
}

/**
 * @module FEATURES
 */
var FEATURES = FEATURES || (function () {

  var instance;

  function init () {
    return {
      transform: css('transform')
    };
  }
  
  return {
    getInstance: function () {
      if (!instance) {
        instance = init();
      }

      return instance;
    }
  };

})();

module.exports = FEATURES.getInstance();