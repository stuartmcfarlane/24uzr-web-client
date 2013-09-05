define(['app'], function (app) {
  'use strict';

  app.controller('Login', ['$scope','$auth', '$location'
  , function ($scope, $auth, $location) {
    
    $scope.login = function () {
      $auth.login($scope.credentials);
    }

    $scope.$on('$auth:loginFailure', function (event, data) {
      if(data === undefined || data === '403') {
        alert('Invalid username/password');
      } 
    });
  }]);
});