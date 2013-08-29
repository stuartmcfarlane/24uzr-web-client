define(['models/point'], function (Point) {
    'use strict';

    function Edge (start, end) {
        this.start = start;
        this.end = end;
    };

    return Edge;
});