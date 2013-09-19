define(['lib/convert'],
    function (convert) {
        'use strict';

        return function edgeHeading(edge) {
            var lat1 = edge.start.location.lat;
            var lon1 = edge.start.location.lon;
            var lat2 = edge.end.location.lat;
            var lon2 = edge.end.location.lon;
            var dLon = lon2 - lon1;
            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
            return convert.rad2deg(Math.atan2(y, x));
        };
    });