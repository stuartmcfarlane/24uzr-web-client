define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'underscore'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
        cost: function(edge) {
            return 1;
        }
    };

    GraphAlgorithms.prototype.dsl = function dsl(graph, start, end, costAvailable, options) {
        options = _.extend({}, defaultOptions, options || {});
        settings.debug && console.log('>dsl: ' + start.name + ' - ' + end.name + ' : ' + costAvailable/3600 + ' hrs');
        var paths = [];
        var that = this;

        if (costAvailable < 0 || costAvailable === NaN) {
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
            var cost = options.cost({start: start, end: child}, costAvailable);
            settings.debug && console.log(' dsl: '+start.name+' -> '+child.name+' : '+new Edge({start: start, end: child}).getLengthMeters()+' m, ' +cost/3600+' hrs');
            // settings.debug && console.log(' dsl: cost', cost/3600, costAvailable/3600);
            return that.dsl.call(that, graph, child, end, costAvailable - cost, options);
        });
        settings.debug && console.log('dsl: allChildPaths', start.name, costAvailable, allChildPaths);
        allChildPaths = allChildPaths
        .filter(function filterChildren(childPaths) {
            // remove dead paths
            return childPaths !== undefined;
        });
        settings.debug && console.log('dsl: allChildPaths filtered', start.name, costAvailable, allChildPaths);
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
        settings.debug && console.log('dsl: paths mapped', start.name, costAvailable, paths);

        settings.debug && console.log('<dsl', paths);
        return paths;
    };

    return GraphAlgorithms;
});