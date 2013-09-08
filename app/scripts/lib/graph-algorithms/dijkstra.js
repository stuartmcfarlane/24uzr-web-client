/*
 * Dinkstra's shortest path algorithm
 *
 * http://en.wikipedia.org/wiki/Dijkstra's_algorithm
 *
 *  1. Assign to every node a tentative distance value: set it to zero for our initial node
 *     and to infinity for all other nodes.
 *  2. Mark all nodes unvisited. Set the initial node as current. Create a set of the
 *     unvisited nodes called the unvisited set consisting of all the nodes except the initial node.
 *  3. For the current node, consider all of its unvisited neighbors and calculate their tentative
 *     distances. For example, if the current node A is marked with a distance of 6, and the edge
 *     connecting it with a neighbor B has length 2, then the distance to B (through A) will be
 *     6 + 2 = 8. If this distance is less than the previously recorded tentative distance of B,
 *     then overwrite that distance. Even though a neighbor has been examined, it is not marked as
 *     "visited" at this time, and it remains in the unvisited set.
 *  4. When we are done considering all of the neighbors of the current node, mark the current node
 *     as visited and remove it from the unvisited set. A visited node will never be checked again.
 *  5. If the destination node has been marked visited (when planning a route between two specific
 *      nodes) or if the smallest tentative distance among the nodes in the unvisited set is infinity
 *      (when planning a complete traversal), then stop. The algorithm has finished.
 *  6. Select the unvisited node that is marked with the smallest tentative distance, and set it as
 *     the new "current node" then go back to step 3.
 *
 */

define(['../graph-algorithms', 'models/path', 'models/edge', 'underscore'], function (GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
        maxLength: 100,
        maxAttempts: 10
    };

    GraphAlgorithms.prototype.dijkstra = function dijkstra(graph, start, end, options) {
        console.log('>dijkstra', graph, start, end, options);
        options = _.extend({}, defaultOptions, options | {});

        var path;

        if (!graph || !graph.vertices || !graph.vertices.length || !start || !end){
            console.log('<dijkstra');
            return undefined;
        }

        var dist = {};
        var previous = {};
        var Q = [];

        graph.vertices.forEach(function initDijkstra(vertex) {
            // Unknown distance function from start to vertex
            dist[vertex._id] = Infinity;
            // Previous node in optimal path from start
            previous[vertex._id] = undefined;
            // All nodes in the graph are unoptimized – thus are in Q
            Q.push(vertex._id);
        });

        // Distance from start to start
        dist[start._id] = 0;

        while (Q.length) {
            // Source node in first case
            var u = _.min(Q, function minDist(vertex) {
                return dist[vertex];
            });
            console.log('u', u);
            Q = Q.filter(function removeShortest(e) { return u !== e; });
            console.log('Q', Q);
            // The following line looks wrong but it isn't.
            // Underscore returns Infinity if it can't find the min which is the case
            // if all elements in Q have the value Infitity
            if (u === Infinity || dist[u] === Infinity) {
                // all remaining vertices are inaccessible from source
                break;
            }
            if (u === end._id) {
                console.log('found');
                // reached end
                // built path back to start
                path = new Path();
                path.prependVertex(graph.findVertexById(u));
                while (previous[u] !== undefined) {
                    path.prependVertex(
                            graph.findVertexById(previous[u]));
                    u = previous[u];
                }
                break;
            }
            // where edge.end has not yet been removed from Q.
            graph.getEdgesFrom(graph.findVertexById(u)).forEach(function eachEdgeFrom(edge) {
                var alt = dist[u] + edge.cost();
                var v = edge.end._id;
                console.log('child cost', v, alt);
                if (alt < dist[v]) {
                    console.log('new shortest', v);
                    dist[v] = alt;
                    previous[v] = u;
                    // Reorder v in the Queue - ???
                }
            });
        }
        console.log('<dijkstra', path);
        return path;
    };

    return GraphAlgorithms;
});