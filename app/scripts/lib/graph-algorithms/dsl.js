define(['../graph-algorithms', 'models/path', 'models/edge', 'underscore'], function (GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
    };

    GraphAlgorithms.prototype.dsl = function dsl(graph, start, end, length) {
        console.log('>dsl', start.name, end.name, length);
        var paths = [];
        var that = this;

        if (length < 0) {
            console.log('<dsl: exhausted', start.name);
            return undefined;
        }
        
        if (start === end) {
            console.log('<dsl: found', start.name, end.name);
            var path = new Path();
            path
            .addVertex(start);
            return [path];
        }
        var children = graph.getChildren(start);
        var allChildPaths = children.map(function childPaths(child) {
            return that.dsl.call(that, graph, child, end, length - 1);
        });
        console.log('dsl: allChildPaths', start.name, length, allChildPaths);
        allChildPaths = allChildPaths
        .filter(function filterChildren(childPaths) {
            // remove dead paths
            return childPaths !== undefined;
        });
        console.log('dsl: allChildPaths filtered', start.name, length, allChildPaths);
        if (!allChildPaths.length) {
            console.log('<dsl: no child paths');
            return undefined;
        }

        allChildPaths.forEach(function buildPath(childPaths) {
            console.log('buildPath', start.name, end.name, childPaths);
            childPaths.forEach(function expandChild(childPath) {
                console.log('expandChildPaths', start.name, end.name, childPath);
                paths.push(childPath.prependVertex(start));
            });
        });
        console.log('dsl: paths mapped', start.name, length, paths);

        console.log('<dsl', paths);
        return paths;
    };

    return GraphAlgorithms;
});