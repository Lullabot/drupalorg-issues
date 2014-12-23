'use strict';

angular.module('drupalKanbanApp.components.url.service', [])

  .factory('urlParams', [function() {
    return function(url, parameter) {
      var queryIndex = url.indexOf('?');
      if (queryIndex !== -1) {
        var query = url.substring(queryIndex + 1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (pair[0] == parameter) {
            return pair[1];
          }
        }
      }
      return false;
    };
  }]);
