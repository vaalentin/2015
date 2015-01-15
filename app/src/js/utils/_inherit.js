'use strict';

var extend = require('./extend');

/**
 * 
 * from backbone.js
 *
 * @param {Object} Properties to merge
 * @return {Function}
 */
function inherit (props) {
  var parent = this;
  var child;

  if (props && hasOwnProperty.call(props, 'constructor')) {
    child = props.constructor;
  } else {
    child = function () { return parent.apply(this, arguments); };
  }

  extend(child, parent);

  var Dummy = function () { this.constructor = child; };
  Dummy.prototype = parent.prototype;
  child.prototype = new Dummy();

  if (props) {
    extend(child.prototype, props);
  }

  child.__super__ = parent.prototype;

  return child;
}

module.exports = inherit;