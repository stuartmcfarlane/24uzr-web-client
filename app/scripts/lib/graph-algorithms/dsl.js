define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'underscore'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
        cost: GraphAlgorithms.prototype.edgeLength
    };

    GraphAlgorithms.prototype.dsl = function dsl(graph, start, end, length, options) {
        options = _.extend({}, defaultOptions, options || {});
        settings.debug && console.log('>dsl', start.name, end.name, length);
        var paths = [];
        var that = this;

        if (length < 0 || length === NaN) {
            settings.debug && console.log('<dsl: exhausted', start.name);
            return undefined;
        }
        
        if (start === end) {
            settings.debug && console.log('<dsl: found', start.name, end.name);
            var path = new Path();
            path
            .addVertex(start);
            return [path];
        }
        var children = graph.getChildren(start);
        var allChildPaths = children.map(function childPaths(child) {
            return that.dsl.call(that, graph, child, end, length - options.cost({start: start, end: child}));
        });
        settings.debug && console.log('dsl: allChildPaths', start.name, length, allChildPaths);
        allChildPaths = allChildPaths
        .filter(function filterChildren(childPaths) {
            // remove dead paths
            return childPaths !== undefined;
        });
        settings.debug && console.log('dsl: allChildPaths filtered', start.name, length, allChildPaths);
        if (!allChildPaths.length) {
            settings.debug && console.log('<dsl: no child paths');
            return undefined;
        }

        allChildPaths.forEach(function buildPath(childPaths) {
            settings.debug && console.log('buildPath', start.name, end.name, childPaths);
            childPaths.forEach(function expandChild(childPath) {
                settings.debug && console.log('expandChildPaths', start.name, end.name, childPath);
                paths.push(childPath.prependVertex(start));
            });
        });
        settings.debug && console.log('dsl: paths mapped', start.name, length, paths);

        settings.debug && console.log('<dsl', paths);
        return paths;
    };

    return GraphAlgorithms;
});