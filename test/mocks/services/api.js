define(['angular', 'app'],function (angular) {
    'use strict';

    ApiServiceMock = {

        get: function (api, id) {
            var def = $q.defer();
            def.resolve({});
            return def.promise;
        },

        query: function (api, id) {
            var def = $q.defer();
            def.resolve({});
            return def.promise;
        },

        create: function (api, object) {
            var def = $q.defer();
            def.resolve({});
            return def.promise;
        },

        update: function (api, object) {
            var def = $q.defer();
            def.resolve({});
            return def.promise;
        },

        delete: function (api, object) {
            var def = $q.defer();
            def.resolve({});
            return def.promise;
        },
    };

});