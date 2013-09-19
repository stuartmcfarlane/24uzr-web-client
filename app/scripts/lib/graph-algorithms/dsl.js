define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'lodash'],
    function (settings, GraphAlgorithms, Path, Edge) {
        'use strict';

        function exhausted(state) {
            if (state.costAvailable < 0 || isNaN(state.costAvailable)) {
                settings.debug.dsl && console.log('exhausted: time\'s up', state.start.name);
                state.pathSoFar.pop();
                return true;
            }
            if (state.pathSoFar.length > 1 && -1 !== state.pathSoFar.indexOf(state.start._id)) {
                var from = state.pathSoFar[state.pathSoFar.length - 2];
                var to = state.pathSoFar[state.pathSoFar.length - 1];
                var count = 0;
                for (var i = 0; i < state.pathSoFar.length - 2; i++) {
                    if (state.pathSoFar[i] === from && state.pathSoFar[i+1] === to) {
                        count++;
                    }
                }
                if (count >= state.maxEdgeRepeats) {
                    settings.debug.dsl && console.log('exhausted: leg limit reached: ' + from + ' - ' + to);
                    state.pathSoFar.pop();
                    return true;
                }
            }
            return false;
        }

        function found(state) {
            if (state.start === state.end) {
                state.pathSoFar.pop();
                return true;
            }
            return false;
        }

        function childState(state, child) {
            var cost = state.costFn({ start: state.start, end: child }, state.costAvailable);
            var nextState = _.extend({}, state, {
                start: child,
                costAvailable: state.costAvailable - cost
            });

            settings.debug.dsl && console.log('childState: '+
                state.start.name+' -> '+child.name+' : '+
                GraphAlgorithms.prototype.edgeLength({start: nextState.start, end: nextState.end})+' m, ' +
                cost/3600+' hrs');
            settings.debug.dsl && console.log(' childState: cost', cost/3600, nextState.costAvailable/3600);
            nextState.pathSoFar.push(child._id);
            return nextState;
        }

        GraphAlgorithms.prototype.dsl = function dsl(graph, state) {
            settings.debug.dsl && console.log('>dsl: ', state);
            settings.debug.dsl && console.log(' dsl: ' +
                state.start.name + ' - ' + state.end.name + ' : ' +
                state.costAvailable/3600 + ' hrs');
            var paths = [];
            var that = this;

            if (found(state)) {
                settings.debug.dsl && console.log('<dsl: found', state.start.name, state.end.name);
                var path = new Path();
                path.addVertex(state.start);
                return [path];
            }

            if (exhausted(state)) {
                settings.debug.dsl && console.log('<dsl: exhausted', state.start.name);
                return undefined;
            }
            
            var children = graph.getChildren(state.start);
            var allChildPaths = children.map(function childPaths(child) {
                return that.dsl.call(that, graph, childState(state, child));
            });

            settings.debug.dsl && console.log('dsl: allChildPaths', state.start.name, state.costAvailable, allChildPaths);
            allChildPaths = allChildPaths
            .filter(function filterChildren(childPaths) {
                // remove dead paths
                return childPaths !== undefined;
            });
            settings.debug.dsl && console.log('dsl: allChildPaths filtered', state.start.name, state.costAvailable, allChildPaths);
            if (!allChildPaths.length) {
                settings.debug.dsl && console.log('<dsl: no child paths');
                return undefined;
            }

            allChildPaths.forEach(function buildPath(childPaths) {
                settings.debug.dsl && console.log('buildPath', state.start.name, state.end.name, childPaths);
                childPaths.forEach(function expandChild(childPath) {
                    settings.debug.dsl && console.log('expandChildPaths', state.start.name, state.end.name, childPath);
                    paths.push(childPath.prependVertex(state.start));
                });
            });
            settings.debug.dsl && console.log('dsl: paths mapped', state.start.name, state.costAvailable, paths);

            settings.debug.dsl && console.log('<dsl', paths);
            state.pathSoFar.pop();
            return paths;
        };

        return GraphAlgorithms;
    }
);