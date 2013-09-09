define([], function() {
    'use strict';
    var performance = window.performance || {};
    performance.now = (function() {
        return performance.now       ||
            performance.mozNow    ||
            performance.msNow     ||
            performance.oNow      ||
            performance.webkitNow ||
            function() {
                //Doh! Crap browser!
                return new Date().getTime();
            };
    })();
    return performance;
});