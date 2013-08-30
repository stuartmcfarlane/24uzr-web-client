define(['angular', 'app'],function (angular) {
    'use strict';

    angular
    .module('app.services')
    .service('ApiService',['$http', '$q', function ($http, $q) {

        var makeUrl = function makeUrl(api, object) {
            var url = '/api/v1/' + api;
            if (object !== undefined) {
                if (typeof object === 'object') {
                    if (object._id !== undefined) {
                        url += '/' + object._id
                    }
                }
                else {
                    url += '/' + object;
                }
            }
            return url;
        }
        return {

            get: function (api, id) {
                var def = $q.defer();

                if (typeof id === 'object') {
                    id = id._id;
                }

                $http.get(makeUrl(api))
                .success(function (res) {
                    def.resolve(res);
                }).error(function (err) {
                    def.reject(err);
                });

                return def.promise;
            },

            query: function (api, id, cb) {
                if (cb === undefined && typeof id === 'function') {
                    cb = id;
                    id = undefined;
                }
                if (typeof cb === 'function') {
                    return $http.get(makeUrl(api, id), cb);
                }
                var def = $q.defer();

                if (typeof id === 'object') {
                    id = id._id;
                }

                $http.get(makeUrl(api, id))
                .success(function (res) {
                    def.resolve(res);
                }).error(function (err) {
                    def.reject(err);
                });

                return def.promise;
            },

            create: function (api, object, cb) {
                if (typeof cb == 'function') {
                    return $http.post(makeUrl(api), object, cb);
                }
                var def = $q.defer();

                $http.post(makeUrl(api), object)
                .success(function (res) {
                    def.resolve(res);
                }).error(function (err) {
                    def.reject(err);
                });

                return def.promise;
            },
        }
    }]);
});
