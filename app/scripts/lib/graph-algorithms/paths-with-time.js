define(['settings', 'lib/convert', '../graph-algorithms', 'models/path', 'models/edge', 'lodash'],
    function (settings, convert, GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
        speed: function speed(edge, time) {
            return convert.knots2mps(6);
        },
        maxEdgeRepeats: 2
    };

    GraphAlgorithms.prototype.pathsWithTime = function pathsWithTime(graph, start, end, options) {
        settings.debug && console.log('>pathsWithTime', graph, start, end, options);
        options = _.extend({}, defaultOptions, options || {});
        if (!options.cost) {
            options.cost = GraphAlgorithms.prototype.makeEdgeSailingTime(options.speed);
        }
        var paths = this.dsl(graph, start, end, options.time, options.cost, [], options.maxEdgeRepeats);
        if (!paths) {
            paths = [];
        }
        settings.debug && console.log('<pathsWithTime', paths);
        return paths;
    };

    return GraphAlgorithms;
});