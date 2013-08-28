define(['app'], function (app) {
  'use strict';

  app.controller('Users', ['$scope', '$auth', function ($scope, $auth) {

    $scope.welcome = "Users.";
    $auth.loadUserList();

    $scope.$on('$auth:loadUserListSuccess', function(userList){
        $scope.users = $auth.getUserList();
    });

  }]);

});