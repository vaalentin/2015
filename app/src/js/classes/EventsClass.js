'use strict';

/**
 * Event bus
 *
 * @class Events
 * @constructor
 */
function Events () {
  this.events = {};
  this.id = -1;
}

/**
 * Register event
 *
 * @method on
 * @param {String} [name]
 * @param {Function} [callback]
 * @return {Number} [id]
 */
Events.prototype.on = function (name, callback) {
  if (!this.events[name]) {
    this.events[name] = [];
  }

  var id = (++this.id).toString();

  this.events[name].push({
    id: id,
    callback: callback
  });

  return id;
};

/**
 * Trigger event
 *
 * @method trigger
 * @param {String} [name]
 * @param {Object} [data]
 */
Events.prototype.trigger = function (name, data) {
  if (!this.events[name]) {
    return false;
  }

  var suscribers = this.events[name];
  for (var i = 0, j = suscribers.length; i < j; i++) {
    suscribers[i].callback.apply(data);
  }
};

module.exports = Events;