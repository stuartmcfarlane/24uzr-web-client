define(['lib/convert', 'models/point', 'lib/graph-algorithms'], function (convert, Point, GraphAlgorithms) {
    'use strict';

    function Edge (edge) {
        this._id = edge._id;
        this.start = edge.start;
        this.end = edge.end;
    }

    Edge.prototype.getLengthMeters = function getLengthMeters() {
        return GraphAlgorithms.prototype.edgeLength(this);
    };

    Edge.prototype.getLengthNauticalMiles = function getLengthNauticalMiles() {
        return convert.m2nm(this.getLengthMeters());
    };

    Edge.prototype.getHeading = function getHeading() {
        return GraphAlgorithms.prototype.edgeHeading(this);
    };

    return Edge;
});