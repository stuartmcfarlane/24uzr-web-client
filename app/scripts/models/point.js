define([], function () {
    'use strict';

    function Point (lat, lon) {
        this.lon = lon;
        this.lat = lat;
    };

    return Point;
});