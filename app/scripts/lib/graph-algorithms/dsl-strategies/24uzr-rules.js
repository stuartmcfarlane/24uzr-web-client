define(['settings', 'lib/convert', 'lib/graph-algorithms/edge-length', 'lodash'],
    function (settings, convert, edgeLength) {
        'use strict';

        function timesUp(state) {
            if (state.timeToGo < 0 || isNaN(state.timeToGo)) {
                settings.debug.dsl && console.log('exhausted: time\'s up', state.start.name);
                return true;
            }
            return false;
        }

        function legHasBeenUsed(state) {
            if (state.pathSoFar.length > 1 && -1 !== state.pathSoFar.indexOf(state.start._id)) {
                var from = state.pathSoFar[state.pathSoFar.length - 2];
                var to = state.pathSoFar[state.pathSoFar.length - 1];
                var count = 0;
                for (var i = 0; i < state.pathSoFar.length - 2; i++) {
                    if (state.pathSoFar[i] === from && state.pathSoFar[i+1] === to ||
                        state.pathSoFar[i] === to && state.pathSoFar[i+1] === from) {
                        if (++count >= 2) {
                            settings.debug.dsl && console.log('exhausted: leg limit reached: ' + from + ' - ' + to);
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        return {
            initState: function initState(start, end, timeToGo, speed) {
                return {
                    start: start,
                    end: end,
                    timeToGo: timeToGo,
                    pathSoFar: [],
                    speed: speed
                };
            },
            exhausted: function exhausted24uzrRules(state) {
                if (timesUp(state)) {
                    state.pathSoFar.pop();
                    return true;
                }
                if (legHasBeenUsed(state)) {
                    state.pathSoFar.pop();
                    return true;
                }
                return false;
            },
            found: function found24uzrRules(state) {
                if (state.start === state.end) {
                    state.pathSoFar.pop();
                    return true;
                }
                return false;
            },
            childState: function childState24uzrRules(state, child) {
                var leg = {
                    start: state.start,
                    end: child
                };
                var mps = state.speed(leg, state.timeToGo);
                var legLength = edgeLength(leg);
                var legTime =  legLength / mps;
                var nextState = _.extend({}, state, {
                    start: child,
                    timeToGo: state.timeToGo - legTime
                });

                settings.debug.dsl && console.log('childState: '+
                    state.start.name+' -> '+child.name+' : '+
                    legLength+' m, ' +
                    legTime/3600+' hrs');
                settings.debug.dsl && console.log(' childState: legTime', legTime/3600, nextState.timeToGo/3600);
                nextState.pathSoFar.push(child._id);
                return nextState;
            }
        };
    }
);