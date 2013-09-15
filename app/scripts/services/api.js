define(['settings', 'angular', 'app'],function (settings, angular) {
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
                settings.debug.api && console.log('get:' + api, arguments[1]);
                var def = $q.defer();

                if (typeof id === 'object') {
                    id = id._id;
                }

                $http.get(makeUrl(api))
                .success(function (res) {
                    settings.debug.api && console.log('<get', res);
                    def.resolve(res);
                }).error(function (err) {
                    def.reject(err);
                });

                return def.promise;
            },

            query: function (api, id, cb) {
                settings.debug.api && console.log('query:' + api, arguments[1]);
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
                    settings.debug.api && console.log('<query', res);
                    def.resolve(res);
                }).error(function (err) {
                    def.reject(err);
                });

                return def.promise;
            },

            create: function (api, object, cb) {
                settings.debug.api && console.log('create:' + api, arguments[1]);
                if (typeof cb == 'function') {
                    return $http.post(makeUrl(api), object, cb);
                }
                var def = $q.defer();

                $http.post(makeUrl(api), object)
                .success(function (res) {
                    settings.debug.api && console.log('<post', res);
                    def.resolve(res);
                }).error(function (err) {
                    def.reject(err);
                });

                return def.promise;
            },

            update: function (api, object, cb) {
                settings.debug.api && console.log('update:' + api, arguments[1]);
                if (typeof cb == 'function') {
                    return $http.put(makeUrl(api), object, cb);
                }
                var def = $q.defer();

                $http.put(makeUrl(api, object), object)
                .success(function (res) {
                    settings.debug.api && console.log('<put', res);
                    def.resolve(res);
                }).error(function (err) {
                    def.reject(err);
                });

                return def.promise;
            },

            remove: function (api, object, cb) {
                settings.debug.api && console.log('remove:' + api, arguments[1]);
                settings.debug.api && console.log('DELETE: ' + makeUrl(api, object));
                if (typeof cb == 'function') {
                    return $http.delete(makeUrl(api), object, cb);
                }
                var def = $q.defer();

                $http.delete(makeUrl(api, object))
                // $http({
                //     method: 'DELETE',
                //     url: makeUrl(api, object)
                // })
                .success(function (res) {
                    settings.debug.api && console.log('<remove', res);
                    def.resolve(res);
                }).error(function (err) {
                    def.reject(err);
                });

                return def.promise;
            },
        }
    }]);
});
