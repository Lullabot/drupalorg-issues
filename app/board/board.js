'use strict';

angular.module('drupalKanbanApp.board.config', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/board', {
            templateUrl: 'app/board/board.html',
            controller: 'BoardController'
        });
    }]);
