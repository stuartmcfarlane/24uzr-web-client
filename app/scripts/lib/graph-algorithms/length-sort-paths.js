define(['settings', 'lodash'],
    function (settings) {
    'use strict';

    var defaultOptions = {
    };

    return function lengthSortPaths(paths, options) {
        settings.debug.trace && console.log('>lengthSortPaths', paths, options);
        options = _.extend({}, defaultOptions, options || {});

        paths.sort(function compareIndex(path1, path2) {
            return path2.lengthMeters - path1.lengthMeters;
        });

        settings.debug.trace && console.log('<lengthSortPaths', paths);
        return paths;
    };
});