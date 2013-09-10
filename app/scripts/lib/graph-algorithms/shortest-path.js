
define(['../graph-algorithms', 'models/path', 'models/edge', 'lodash', './dijkstra'], function (GraphAlgorithms, Path, Edge) {
    'use strict';

    GraphAlgorithms.prototype.shortestPath = GraphAlgorithms.prototype.dijkstra;    
    
    return GraphAlgorithms;
});