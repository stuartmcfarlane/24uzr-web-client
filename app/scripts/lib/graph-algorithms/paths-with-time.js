define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'underscore'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    function knots2mps(knots) {
        return knots * 0.51444444444;
    }
    var defaultOptions = {
        speed: function speed(edge, time) {
            return knots2mps(6);
        }
    };

    GraphAlgorithms.prototype.pathsWithTime = function pathsWithTime(graph, start, end, options) {
        settings.debug && console.log('>pathsWithTime', graph, start, end, options);
        options = _.extend({}, defaultOptions, options || {});
        options.cost = GraphAlgorithms.prototype.makeEdgeSailingTime(options.speed);
        var paths = this.dsl(graph, start, end, options.time, options);
        if (!paths) {
            paths = [];
        }
        settings.debug && console.log('<pathsWithTime', paths);
        return paths;
    };

    return GraphAlgorithms;
});