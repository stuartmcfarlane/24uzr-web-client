define([
    'lib/convert',
    'models/point',
    'lib/graph-algorithms/edge-length',
    'lib/graph-algorithms/edge-heading'
], function (
    convert,
    Point,
    edgeLength,
    edgeHeading)
{
    'use strict';

    function Edge (edge) {
        this._id = edge._id;
        this.start = edge.start;
        this.end = edge.end;
    }

    Edge.prototype.getLengthMeters = function getLengthMeters() {
        return edgeLength(this);
    };

    Edge.prototype.getLengthNauticalMiles = function getLengthNauticalMiles() {
        return convert.m2nm(this.getLengthMeters());
    };

    Edge.prototype.getHeading = function getHeading() {
        return edgeHeading(this);
    };

    return Edge;
});