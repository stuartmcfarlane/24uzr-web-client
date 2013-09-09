define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'underscore'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    GraphAlgorithms.prototype.makeEdgeSailingTime = function makeEdgeSailingTime(speed) {
        return function edgeSailingTime(edge) {
            return this.edgeLength(edge) * speed();
        };
    };

    return GraphAlgorithms;
});