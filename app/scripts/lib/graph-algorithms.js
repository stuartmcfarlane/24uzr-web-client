define([
    'lib/graph-algorithms/dijkstra',
    'lib/graph-algorithms/dsl',
    'lib/graph-algorithms/edge-heading',
    'lib/graph-algorithms/edge-histogram',
    'lib/graph-algorithms/edge-length',
    'lib/graph-algorithms/edge-sailing-time',
    'lib/graph-algorithms/length-sort-paths',
    'lib/graph-algorithms/paths-with-time',
    'lib/graph-algorithms/random-path',
    'lib/graph-algorithms/shortest-path',
    'lib/graph-algorithms/dsl-strategies/24uzr-rules'
], function (
    dijkstra,
    dsl,
    edgeHeading,
    edgeHistogram,
    edgeLength,
    edgeSailingTime,
    lengthSortPaths,
    pathsWithTime,
    randomPath,
    shortestPath,
    strategy24uzrRules
) {
    'use strict';

    return {
        dijkstra: dijkstra,
        dsl: dsl,
        edgeHeading: edgeHeading,
        edgeHistogram: edgeHistogram,
        edgeLength: edgeLength,
        edgeSailingTime: edgeSailingTime,
        lengthSortPaths: lengthSortPaths,
        pathsWithTime: pathsWithTime,
        randomPath: randomPath,
        shortestPath: shortestPath,
        strategies: {
            strategy24uzrRules: strategy24uzrRules
        }
    };
});
