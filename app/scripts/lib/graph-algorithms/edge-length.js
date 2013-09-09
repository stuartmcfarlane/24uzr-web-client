define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'underscore'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    GraphAlgorithms.prototype.edgeLength = function edgeLength(edge) {
        var dx = edge.end.location.x - edge.start.location.x;
        var dy = edge.end.location.y - edge.start.location.y;
        return Math.sqrt(dx*dx + dy*dy);
    };

    return GraphAlgorithms;
});