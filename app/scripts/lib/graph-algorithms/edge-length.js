define(['lib/convert', '../graph-algorithms'],
    function (convert, GraphAlgorithms) {
    'use strict';

    GraphAlgorithms.prototype.edgeLength = function edgeLength(edge) {

        var lat1 = edge.start.location.lat;
        var lon1 = edge.start.location.lon;
        var lat2 = edge.end.location.lat;
        var lon2 = edge.end.location.lon;

        var R = 6371; // km
        var dLat = convert.deg2rad(lat2-lat1);
        var dLon = convert.deg2rad(lon2-lon1);
        
        lat1 = convert.deg2rad(lat1);
        lat2 = convert.deg2rad(lat2);

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // km
        d *= 1000; // m

        return d;
    };

    // GraphAlgorithms.prototype.edgeLength = function edgeLength(edge) {
    //     var dx = edge.end.location.x - edge.start.location.x;
    //     var dy = edge.end.location.y - edge.start.location.y;
    //     return Math.sqrt(dx*dx + dy*dy);
    // };

    return GraphAlgorithms;
});