define(['angular', 'app'], function (angular, app) {
  
  'use strict';

  app.config(
    ['$routeProvider', '$templatesProvider'
    , function ($routeProvider, $templatesProvider) {

    var t = $templatesProvider;

    $routeProvider
      .when('/', {
        templateUrl: t.view('home'),
        controller: 'Home',
        public: true
      })
      .when('/users', {
        templateUrl: t.view('users'),
        controller: 'Users'
      })
      .when('/map', {
        templateUrl: t.view('map'),
        controller: 'Map'
      })
      .when('/login', {
        templateUrl: t.view('login'),
        controller: 'Login',
        public: true
      })
      .when('/logout', {
        templateUrl: t.view('login'),
        controller: 'Logout',
        public: true
      })
      .when('/register', {
        templateUrl: t.view('registration'),
        controller: 'Registration',
        public: true
      })
      .when('/error', {
        templateUrl: t.partial('error'),
        public: true
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);

});