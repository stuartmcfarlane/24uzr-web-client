define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'underscore'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    /*
     * speed is a function that takes an edge and the time and returns the average speed
     * travelled over the edge given that the edge is atrtted at time
     */
    GraphAlgorithms.prototype.makeEdgeSailingTime = function makeEdgeSailingTime(speed, startTime, raceTime) {
        return function edgeSailingTime(edge, timeToGo) {
            var distance = GraphAlgorithms.prototype.edgeLength(edge);
            var velocity = speed(edge, startTime + raceTime - timeToGo);
            settings.debug && console.log(distance+'m, '+velocity + ' m/s');
            return distance / velocity;
        };
    };

    return GraphAlgorithms;
});