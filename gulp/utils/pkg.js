'use strict';

var fs = require('fs');

/**
 * Expose package.json.
 *
 * @module pkg
 * @return {Object} [pkg]
 * @return {Boolean} [pkg.debug]  Debug?
 * @return {Object} [pkg.vendor] Vendors
 */
var pkg = (function () {
  var instance;

  function init () {
    var data = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    return {
      debug: data.debug || false,
      watch: data.watch || false,
      vendor: data.browser || {}
    }
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

module.exports = pkg.getInstance();
