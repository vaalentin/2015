'use strict';

var jQuery = require('jquery');

/**
 * Extract the current hash
 * and return the corresponding name
 *
 * @module HASH
 * @requires jQuery
 */
var HASH = HASH || (function () {
  var instance = null;

  function init () {
    var agencies = {
      akqa: 'AKQA',
      hki: 'HKI',
      grouek: 'Grouek',
      mediamonks: 'Media Monks',
      soleilnoir: 'Soleil Noir',
      thread: 'Thread',
      ultranoir: 'Ultra Noir'
    };

    function getHash () {
      return window.location.hash.split('#')[1];
    }

    function getAgency (hash) {
      var agency;

      if (hash && agencies[hash]) {
        agency = agencies[hash];
      } else {
        agency = '';
      }

      return agency;
    }

    var hash = getHash();
    var agency = getAgency(hash);

    return {
      hash: hash,
      agency: agency,

      /**
       * Replace all the placeholders by correct agency name
       *
       * @method replacePlaceholders
       */
      replacePlaceholders: function () {
        var $placeholders = jQuery('.placeholder--agency');
        
        $placeholders.each(function () {
          var $placeholder = jQuery(this);

          if ($placeholder.hasClass('placeholder--agency--you')) {
            if (agency !== '') {
              $placeholder.html(agency);
            } else {
              $placeholder.html('you');
            }
          } else {
            if ($placeholder.hasClass('placeholder--agency--capital')) {
              $placeholder.html(agency.toUpperCase());
            } else {
              $placeholder.html(agency);
            }
          }
        });

        var $email = jQuery('.placeholder--email');

        var subject = hash ? '?subject=Hi from ' + agency : '?subject=Hi';
        var body = hash ? '&body=Hi V, we like your work and would love to meet you.' : '&body=Hi V';

        $email.attr('href', [
          'mailto:valentin.marmonier@gmail.com',
          subject,
          body
        ].join(''));
      }
    };
  }

  return {
    /**
     * Get HASH current instance
     *
     * @method getInstance
     * @return {HASH}
     */
    getInstance: function () {
      if (!instance) {
        instance = init();
      }

      return instance;
    }
  };
})();

module.exports = HASH.getInstance();