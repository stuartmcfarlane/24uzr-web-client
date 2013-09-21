define(['lodash', 'settings', 'lib/graph-algorithms/edge-length'],
    function (_, settings, edgeLength) {
    'use strict';

    /*
     * speed is a function that takes an edge and the time and returns the average speed
     * travelled over the edge given that the edge is atrtted at time
     */
    return function makeEdgeSailingTime(speed) {
        return function edgeSailingTime(edge, time) {
            var distance = edgeLength(edge);
            var velocity = speed(edge, time);
            settings.debug.trace && console.log(edge.start.name+' -> '+edge.end.name+': '+distance+' m, '+velocity + ' m/s');
            return distance / velocity;
        };
    };
});