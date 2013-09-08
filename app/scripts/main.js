require.config({
    pathUrl: '/app/scripts',
    paths: {
        angular: '../components/angular-unstable/angular',
        async: '../components/async/lib/async',
        jquery: '../components/jquery/jquery',
        underscore: '../components/underscore/underscore',
        ngResource: '../components/angular-resource-unstable/angular-resource',
        'http-auth-interceptor': '../components/angular-http-auth/src/http-auth-interceptor',
        sigma: '../components/sigma/sigma',
    },
    shim: {
        angular: {
            exports: 'angular'
        },

        'http-auth-interceptor': {
            deps: ['angular']
        },

        ngResource: {
            deps: ['angular']
        },
    }
});

require([
    'angular',
    'ngResource',
    'http-auth-interceptor',
    'sigma',

    // Init
    'app',

    // Config
    'routes',
    'config',
    'settings',

    // Lib
    'lib/graph-adapter',
    'lib/graph-algorithms',
    'lib/graph-algorithms/dijkstra',
    'lib/graph-algorithms/dsl',
    'lib/graph-algorithms/random-path',
    'lib/graph-algorithms/shortest-path',
    'lib/graph-algorithms/paths-with-length',

    // Models
    'models/point',
    'models/edge',
    'models/graph',
    'models/path',
    'models/bouy',

    // Controllers
    'controllers/home',
    'controllers/navbar',
    'controllers/login',
    'controllers/logout',
    'controllers/registration',
    'controllers/map',

    // Directives
    'directives/string-to-number',

    // Filters
    'filters/starts-with',

    // Services
    'services/debug',
    'services/http-options',
    'services/user',
    'services/api',
    'services/templates',
    'services/browser-detect',
    'services/resource-factory',
    'services/auth',
    ], function (angular) {
        'use strict';

        angular.element(document).ready(function () {
            angular.bootstrap(document, ['app']);
        });
    });