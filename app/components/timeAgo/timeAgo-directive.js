'use strict';

angular.module('drupalKanbanApp.components.timeAgo.directive', [])

  .directive('timeAgo', [function() {
    function link(scope, element, attrs) {

      function getTimeAgo(epoch) {
        var secs = ((new Date()).getTime() / 1000) - epoch;
        Math.floor(secs);
        var minutes = secs / 60;
        secs = Math.floor(secs % 60);
        if (minutes < 1) {
          return secs + (secs > 1 ? ' seconds ago' : ' second ago');
        }
        var hours = minutes / 60;
        minutes = Math.floor(minutes % 60);
        if (hours < 1) {
          return minutes + (minutes > 1 ? ' minutes ago' : ' minute ago');
        }
        var days = hours / 24;
        hours = Math.floor(hours % 24);
        if (days < 1) {
          return hours + (hours > 1 ? ' hours ago' : ' hour ago');
        }
        var weeks = days / 7;
        days = Math.floor(days % 7);
        if (weeks < 1) {
          return days + (days > 1 ? ' days ago' : ' day ago');
        }
        var months = weeks / 4.35;
        weeks = Math.floor(weeks % 4.35);
        if (months < 1) {
          return weeks + (weeks > 1 ? ' weeks ago' : ' week ago');
        }
        var years = months / 12;
        months = Math.floor(months % 12);
        if (years < 1) {
          return months + (months > 1 ? ' months ago' : ' month ago');
        }
        years = Math.floor(years);
        return years + (years > 1 ? ' years ago' : ' year ago');
      }

      element.text(getTimeAgo(attrs.timeAgo));
    }

    return {
      link: link
    };
  }]);
