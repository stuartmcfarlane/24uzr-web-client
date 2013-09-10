define(['models/point', 'lib/graph-algorithms'], function (Point, GraphAlgorithms) {
    'use strict';

    function Edge (edge) {
        this._id = edge._id;
        this.start = edge.start;
        this.end = edge.end;
    }

    function toRad(Value) {
        /** Converts numeric degrees to radians */
        return Value * Math.PI / 180;
    }

    Edge.prototype.getLengthMeters = function getLengthMeters() {
        return GraphAlgorithms.prototype.edgeLength(this);
    };

    return Edge;
});