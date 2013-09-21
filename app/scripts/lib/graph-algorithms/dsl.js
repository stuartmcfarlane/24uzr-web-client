define(['lodash', 'settings', 'models/path', 'models/edge'],
    function (_, settings, Path, Edge) {
        'use strict';

        return function dsl(graph, start, end, options) {

            var defaultStrategy = {
                exhausted: function exhaustedDefault(state) {
                    if (state.costAvailable < 0 || isNaN(state.costAvailable)) {
                        settings.debug.dsl && console.log('exhausted: time\'s up', state.start.name);
                        return true;
                    }
                },
                found: function foundDefault(state) {
                    if (state.start === state.end) {
                        return true;
                    }
                    return false;
                },
                childState: function childStateDefault(state, child) {
                    var cost = 1;
                    var nextState = _.extend({}, state, {
                        start: child,
                        costAvailable: state.costAvailable - cost
                    });

                    return nextState;
                }
            };
            var defaultInitialState = {
                costAvailable: 0
            };

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
                strategy: defaultStrategy,
                state: defaultInitialState
            };

            options = _.extend({}, defaultOptions, options);
            var state = _.extend({}, options.state, {
                start: start,
                end: end
            });

            return search(graph, state);

        };
    }
);