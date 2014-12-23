'use strict';

var app = angular.module('drupalKanbanApp',[
    'drupalKanbanApp.board.config',
    'drupalKanbanApp.board.controller'
])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/board'});
}]);
