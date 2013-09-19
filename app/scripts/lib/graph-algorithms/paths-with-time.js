define(['settings', 'lib/convert', '../graph-algorithms', 'models/path', 'models/edge', 'lodash'],
    function (settings, convert, GraphAlgorithms, Path, Edge) {
    'use strict';

    GraphAlgorithms.prototype.pathsWithTime = function pathsWithTime(graph, start, end, options) {

        var defaultOptions = {
            speed: function speed(edge, time) {
                return convert.knots2mps(6);
            },
            maxEdgeRepeats: 2
        };

        var strategy = {
            exhausted: function exhausted(state) {
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
            },
            found: function found(state) {
                if (state.start === state.end) {
                    state.pathSoFar.pop();
                    return true;
                }
                return false;
            },
            childState: function childState(state, child) {
                var cost = options.cost({ start: state.start, end: child }, state.costAvailable);
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
        };

        settings.debug.trace && console.log('>pathsWithTime', graph, start, end, options);
        options = _.extend({}, defaultOptions, options || {});
        if (!options.cost) {
            options.cost = GraphAlgorithms.prototype.makeEdgeSailingTime(options.speed);
        }
        var paths = this.dsl(graph, start, end, {
            strategy: strategy,
            state: {
                maxEdgeRepeats: options.maxEdgeRepeats,
                costAvailable: options.time,
                pathSoFar: []
            }
        });
        if (!paths) {
            paths = [];
        }
        settings.debug.trace && console.log('<pathsWithTime', paths);
        return paths;
    };

    return GraphAlgorithms;
});