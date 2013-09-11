define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'lodash'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
    };

    GraphAlgorithms.prototype.lengthSortPaths = function lengthSortPaths(paths, options) {
        settings.debug && console.log('>lengthSortPaths', paths, options);
        options = _.extend({}, defaultOptions, options || {});

        paths = paths.map(function pathLength(path) {
            return _.extend({}, path, {
                lengthMeters: path.getLengthMeters()
            });
        });

        paths.sort(function compareIndex(path1, path2) {
            return path2.lengthMeters - path1.lengthMeters;
        });

        settings.debug && console.log('<lengthSortPaths', paths);
        return paths;
    };

    return GraphAlgorithms;
});