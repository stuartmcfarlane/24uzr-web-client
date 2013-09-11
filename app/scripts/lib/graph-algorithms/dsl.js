define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'lodash'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    GraphAlgorithms.prototype.dsl = function dsl(graph, start, end, costAvailable, costFn, pathSoFar, maxEdgeRepeats) {
        settings.debug && console.log('>dsl: ' + start.name + ' - ' + end.name + ' : ' + costAvailable/3600 + ' hrs');
        var paths = [];
        var that = this;

        if (costAvailable < 0 || costAvailable === NaN) {
            settings.debug && console.log('<dsl: exhausted', start.name);
            pathSoFar.pop();
            return undefined;
        }
        
        if (start === end) {
            settings.debug && console.log('<dsl: found', start.name, end.name);
            var path = new Path();
            path.addVertex(start);
            pathSoFar.pop();
            return [path];
        }
        if (pathSoFar.length > 1 && -1 !== pathSoFar.indexOf(start._id)) {
            var from = pathSoFar[pathSoFar.length - 2];
            var to = pathSoFar[pathSoFar.length - 1];
            var count = 0;
            for (var i = 0; i < pathSoFar.length - 2; i++) {
                if (pathSoFar[i] === from && pathSoFar[i+1] === to) {
                    count++;
                }
            }
            if (count > maxEdgeRepeats) {
                settings.debug && console.log('<dsl: leg limit reached: ' + from + ' - ' + to);
                pathSoFar.pop();
                return undefined;
            }

        }
        var children = graph.getChildren(start);
        var allChildPaths = children.map(function childPaths(child) {
            var cost = costFn({start: start, end: child}, costAvailable);
            settings.debug && console.log(' dsl: '+start.name+' -> '+child.name+' : '+GraphAlgorithms.prototype.edgeLength({start: start, end: child})+' m, ' +cost/3600+' hrs');
            settings.debug && console.log(' dsl: cost', cost/3600, costAvailable/3600);
            pathSoFar.push(child._id);
            return that.dsl.call(that, graph, child, end, costAvailable - cost, costFn, pathSoFar, maxEdgeRepeats);
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
        pathSoFar.pop();
        return paths;
    };

    return GraphAlgorithms;
});