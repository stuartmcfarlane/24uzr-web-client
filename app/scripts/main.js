require.config({
    pathUrl: '/app/scripts',
    paths: {
        angular: '../components/angular-unstable/angular',
        async: '../components/async/lib/async',
        jquery: '../components/jquery/jquery',
        // lodash: '../components/lodash/lodash',
        lodash: '../components/lodash/lodash',
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
    'lib/convert',
    'lib/graph-adapter',
    'lib/graph-algorithms',
    'lib/graph-algorithms/edge-heading',
    'lib/graph-algorithms/edge-length',
    'lib/graph-algorithms/edge-sailing-time',
    'lib/graph-algorithms/dijkstra',
    'lib/graph-algorithms/dsl',
    'lib/graph-algorithms/random-path',
    'lib/graph-algorithms/shortest-path',
    'lib/graph-algorithms/paths-with-length',
    'lib/graph-algorithms/paths-with-time',
    'lib/graph-algorithms/edge-histogram',
    'lib/graph-algorithms/length-sort-paths',

    // Models
    'models/point',
    'models/edge',
    'models/graph',
    'models/path',
    'models/bouy',
    'models/ship',

    // Controllers
    'controllers/home',
    'controllers/navbar',
    'controllers/login',
    'controllers/logout',
    'controllers/registration',
    'controllers/planner',
    'controllers/map',
    'controllers/ship',

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