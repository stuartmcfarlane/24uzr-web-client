define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'lodash'],
    function (settings, GraphAlgorithms, Path, Edge) {
        'use strict';

        GraphAlgorithms.prototype.dsl = function dsl(graph, start, end, options) {

            function exhausted(state) {
                if (state.costAvailable < 0 || isNaN(state.costAvailable)) {
                    settings.debug.dsl && console.log('exhausted: time\'s up', state.start.name);
                    return true;
                }
            }

            function found(state) {
                if (state.start === state.end) {
                    return true;
                }
                return false;
            }

            function childState(state, child) {
                var cost = 1;
                var nextState = _.extend({}, state, {
                    start: child,
                    costAvailable: state.costAvailable - cost
                });

                return nextState;
            }

            function search(graph, state) {
                settings.debug.dsl && console.log('>dsl: ', state);
                settings.debug.dsl && console.log(' dsl: ' +
                    state.start.name + ' - ' + state.end.name + ' : ' +
                    state.costAvailable/3600 + ' hrs');
                var paths = [];

                if (options.strategy.found(state)) {
                    settings.debug.dsl && console.log('<dsl: found', state.start.name, state.end.name);
                    var path = new Path();
                    path.addVertex(state.start);
                    return [path];
                }

                if (options.strategy.exhausted(state)) {
                    settings.debug.dsl && console.log('<dsl: exhausted', state.start.name);
                    return undefined;
                }
                
                var children = graph.getChildren(state.start);
                var allChildPaths = children.map(function childPaths(child) {
                    return search(graph, options.strategy.childState(state, child));
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
            }

            var defaultOptions = {
                strategy: {
                    exhausted: exhausted,
                    found: found,
                    childState: childState
                },
                state: {
                    costAvailable: 0
                }
            };

            options = _.merge({}, defaultOptions, options);
            var state = _.extend({}, options.state, {
                start: start,
                end: end
            });

            return search(graph, state);

        }

        return GraphAlgorithms;
    }
);