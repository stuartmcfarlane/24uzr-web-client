define(['models/point'], function (Point) {
    'use strict';

    function Edge (edge) {
        this._id = edge._id;
        this.start = edge.start;
        this.end = edge.end;
    }

    Edge.prototype.cost = function cost() {
        return 1;
    }

    return Edge;
});