'use strict';

angular.module('drupalKanbanApp.board.controller', [
  'drupalKanbanApp.components.url.service',
  'drupalKanbanApp.components.timeAgo.directive',
  'drupalKanbanApp.components.angucomplete-alt'
])

  .controller('BoardController', ['$http', '$scope', 'urlParams', function ($http, $scope, urlParams) {

    $scope.priorityMap = {
      400: {
        'name': 'Critical',
        'class': 'panel-danger'
      },
      300: {
        'name': 'Major',
        'class': 'panel-warning'
      },
      200: {
        'name': 'Normal',
        'class': 'panel-info'
      },
      100: {
        'name': 'Minor',
        'class': ''
      }
    };

    $scope.columns = [
      {
        'name': 'Active / Needs work / Patch',
        'id': 'active',
        'collapsed': false,
        'status': [13, 15, 1],
        'issues': []
      },
      {
        'name': 'Needs review',
        'id': 'review',
        'collapsed': false,
        'status': [8],
        'issues': []
      },
      {
        'name': 'RTBC',
        'id': 'rtbc',
        'collapsed': false,
        'status': [14],
        'issues': []
      },
      {
        'name': 'Fixed',
        'id': 'done',
        'collapsed': false,
        'status': [2],
        'issues': []
      }
    ];

    $scope.statusMap = {
      1: {
        'name': 'Active',
        'issues': []
      },
      13: {
        'name': 'Needs work',
        'issues': []
      },
      8: {
        'name': 'Needs review',
        'issues': []
      },
      14: {
        'name': 'Reviewed & tested by the community',
        'issues': []
      },
      15: {
        'name': 'Patch (to be ported)',
        'issues': []
      },
      2: {
        'name': 'Fixed',
        'issues': []
      },
      4: {
        'name': 'Postponed',
        'issues': []
      },
      16: {
        'name': 'Postponed (maintainer needs more info)',
        'issues': []
      },
      3: {
        'name': 'Closed (duplicate)',
        'issues': []
      },
      5: {
        'name': 'Closed (won\'t fix)',
        'issues': []
      },
      6: {
        'name': 'Closed (works as designed)',
        'issues': []
      },
      18: {
        'name': 'Closed (cannot reproduce)',
        'issues': []
      },
      7: {
        'name': 'Closed (fixed)',
        'issues': []
      }
    };

    /**
     * Called when the filter form is submitted.
     */
    $scope.updateFilters = function() {
      var project = $scope.projectSelected;
      if ($scope.projectSelected.title) {
        var project = $scope.projectSelected.title;
      }
      var projectID = project.substring(project.lastIndexOf('(') + 1, project.length - 1);

      window.location.hash = '#/board?project=' + projectID;
      if ($scope.version) {
        window.location.hash += '&version=' + $scope.version;
      }

      if ($scope.tagSelected) {
        $http({
          method: 'GET',
          url: 'https://www.drupal.org/api-d7/taxonomy_term.json?name=' + $scope.tagSelected
        })
          .success(function (termData, termStatus, termHeaders, termConfig) {
            if (termData && termData.list && termData.list[0] && termData.list[0].tid) {
              window.location.hash += '&tags=' + termData.list[0].tid;
              window.location.reload(true);
            }
          })
          .error(function(data, status, headers, config) {
            window.location.reload(true);
          });
      }
      else {
        window.location.reload(true);
      }
    };

    /**
     * Reformats the response from drupal.org into something that angucomplete
     * can understand.
     */
    $scope.angucompleteResponseFormatter = function(response) {
      var newResponse = {
        items: []
      };
      angular.forEach(response, function(value, key) {
        newResponse.items.push({project: key});
      });

      return newResponse;
    };

    $scope.order_item = 'field_issue_priority';
    $scope.order_reverse = true;
    $scope.project = 3060;
    $scope.tags = null;
    $scope.version = null;

    // Get filters from the URL.
    var lProject = urlParams(location.href, 'project');
    if (lProject) {
      $scope.project = lProject;
    }
    var lTags = urlParams(location.href, 'tags');
    if (lTags) {
      $scope.tags = lTags;
    }
    var lVersion = urlParams(location.href, 'version');
    if (lVersion) {
      $scope.version = lVersion;
    }

    /**
     * Updates all the cards on the board.
     */
    var updateBoard = function (items) {
      for (var i = 0; i < items.length; i++) {
        items[i].drupalKanban = {};
        if (items[i].field_issue_status) {
          if (items[i].field_issue_assigned && items[i].field_issue_assigned.id) {
            items[i].drupalKanban.assigned = 'glyphicon-ok';
          }
          else {
            items[i].drupalKanban.assigned = 'glyphicon-remove';
          }
          $scope.statusMap[items[i].field_issue_status].issues.push(items[i]);
        }
      }

      for (var j = 0; j < $scope.columns.length; j++) {
        for (var k = 0; k < $scope.columns[j].status.length; k++) {
          var status = $scope.columns[j].status[k];
          for (var l = 0; l < $scope.statusMap[status].issues.length; l++) {
            $scope.columns[j].issues.push($scope.statusMap[status].issues[l]);
          }
          $scope.statusMap[status].issues = [];
        }
      }
    };

    /**
     * Fetches the Issue data from drupal.org.
     */
    var getData = function (issue_status, page, last) {
      $scope.statusMap[issue_status].total_issues = 'loading...';
      var maxPages = 2;
      var url = 'https://www.drupal.org/api-d7/node.json?type=project_issue&field_project=' + $scope.project + '&field_issue_status=' + issue_status + '&sort=field_issue_priority&direction=DESC';

      // Add optional filters.
      if ($scope.tags) {
        url += '&taxonomy_vocabulary_9=' + $scope.tags;
      }
      if ($scope.version) {
        url += '&field_issue_version=' + $scope.version;
      }

      if (page < maxPages) {
        $http({
          method: 'GET',
          url: url + '&page=' + page
        })
          .success(function (data, status, headers, config) {
            if (data && data.list && data.list.length > 0) {
              updateBoard(data.list);
              if (data.list.length < 100) {
                getData(issue_status, maxPages + 1, data.last);
              }
              else {
                getData(issue_status, page + 1, data.last);
              }
            }
            else {
              $scope.statusMap[issue_status].total_issues = '0';
            }
          })
          .error(function(data, status, headers, config) {
            $scope.statusMap[issue_status].total_issues = 'error loading';
          });
      }
      else {
        var last_page = urlParams(last, 'page');
        // Get the last page to figure out how many items are remaining.
        $scope.statusMap[issue_status].total_issues = 0;
        if (last_page >= maxPages) {
          $http({
            method: 'GET',
            url: url + last_page
          }).
            success(function (data, status, headers, config) {
              var last_items = 0;
              if (data && data.list && data.list.length > 0) {
                last_items = data.list.length;
              }
              $scope.statusMap[issue_status].total_issues = (last_page * 100) + last_items - (maxPages * 100);
            });
        }
      }
    };

    /**
     * Fires off all the data gathering and population functions.
     */
    var populateBoard = function(data) {

    };

    // Get the project information and load the board.
    $http({
      method: 'GET',
      url: 'https://www.drupal.org/api-d7/node.json?nid=' + $scope.project
    })
      .success(function (data, status, headers, config) {
        if (data && data.list && data.list.length > 0) {
          var project = data.list[0];
          if (project.field_project_type === 'full') {
            $scope.projectSelected = project.title + ' (' + $scope.project + ')';

            if ($scope.tags) {
              $scope.tagSelected = $scope.tags;
              $http({
                method: 'GET',
                url: 'https://www.drupal.org/api-d7/taxonomy_term.json?tid=' + $scope.tags
              })
                .success(function (tagData, tagStatus, tagHeaders, tagConfig) {
                  if (tagData && tagData.list && tagData.list[0] && tagData.list[0].name) {
                    $scope.tagSelected = tagData.list[0].name;
                  }
                });
            }

            for (var i = 0; i < $scope.columns.length; i++) {
              for (var j = 0; j < $scope.columns[i].status.length; j++) {
                getData($scope.columns[i].status[j], 0);
              }
            }
          }
        }
      });
  }]);
