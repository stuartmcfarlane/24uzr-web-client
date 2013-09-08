define(['../graph-algorithms', 'models/path', 'models/edge', 'underscore'], function (GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
    };

    GraphAlgorithms.prototype.pathsWithLength = function pathsWithLength(graph, start, end, options) {
        console.log('>pathsWithLength', graph, start, end, options);
        var paths = this.dsl(graph, start, end, ~~options.length);
        if (!paths) {
            paths = [];
        }
        console.log('<pathsWithLength', paths);
        return paths;
    };

    return GraphAlgorithms;
});