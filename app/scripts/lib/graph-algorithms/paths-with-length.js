define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'underscore'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
    };

    GraphAlgorithms.prototype.pathsWithLength = function pathsWithLength(graph, start, end, options) {
        settings.debug && console.log('>pathsWithLength', graph, start, end, options);
        options = _.extend({}, defaultOptions, options || {});
        var paths = this.dsl(graph, start, end, ~~options.length);
        if (!paths) {
            paths = [];
        }
        settings.debug && console.log('<pathsWithLength', paths);
        return paths;
    };

    return GraphAlgorithms;
});