define([
    'lib/convert',
    'models/point',
    'lib/graph-algorithms/edge-length',
    'lib/graph-algorithms/edge-heading',
    'lib/format'
], function (
    convert,
    Point,
    edgeLength,
    edgeHeading,
    format
) {
    'use strict';

    function Edge (edge) {
        this._id = edge._id;
        this.start = edge.start;
        this.end = edge.end;
    }

    Edge.prototype.getLengthMeters = function getLengthMeters() {
        return this.lengthMeters || edgeLength(this);
    };

    Edge.prototype.getLengthNauticalMiles = function getLengthNauticalMiles() {
        return convert.m2nm(this.getLengthMeters());
    };

    Edge.prototype.getSpeedKnots = function getSpeedKnots() {
        return convert.mps2knots(this.mps);
    };

    Edge.prototype.getTimeHours = function getTimeHours() {
        return format.hours(this.timeSeconds / 3600);
    };

    Edge.prototype.getHeading = function getHeading() {
        return edgeHeading(this);
    };

    return Edge;
});