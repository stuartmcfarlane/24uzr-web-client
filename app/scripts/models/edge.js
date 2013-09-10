define(['models/point', 'lib/graph-algorithms'], function (Point, GraphAlgorithms) {
    'use strict';

    function Edge (edge) {
        this._id = edge._id;
        this.start = edge.start;
        this.end = edge.end;
    }

    Edge.prototype.getLengthMeters = function getLengthMeters() {
        return GraphAlgorithms.prototype.edgeLength(this);
    };

    Edge.prototype.getHeading = function getHeading() {
        return GraphAlgorithms.prototype.edgeHeading(edge);
    };

    return Edge;
});