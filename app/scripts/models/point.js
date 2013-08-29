define([], function () {
    'use strict';

    function Point (latitude, longitude) {
        if (latitude === undefined) {
            latitude = 0;
        }
        if (longitude === undefined) {
            longitude = 0;
        }
        this.latitude = latitude;
        this.longitude = longitude;
    };

    return Point;
});