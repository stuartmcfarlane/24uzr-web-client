define(['../graph-algorithms', 'models/path', 'underscore'], function (GraphAlgorithms, Path) {
    'use strict';

    var defaultOptions = {
        maxLength: 100,
        maxAttempts: 10
    };

    GraphAlgorithms.prototype.randomPath = function randomPath(graph, start, end, options) {
        options = _.extend({}, defaultOptions, options | {});

        var path;
        var node = start;
        var attemptsToGo = options.maxAttempts;

        while (node && node !== end && attemptsToGo-- > 0) {
            console.log('attemptsToGo: ', attemptsToGo);
            path = new Path();
            path.addVertex(node);
            var children = graph.getChildren(node);
            while (node && node !== end && children.length > 0 && path.edges.length <= options.maxLength) {
                console.log('node: ', node);
                console.log('children: ', children);
                var randomIdx = Math.floor(Math.random() * children.length);
                console.log('randomIdx', randomIdx);
                node = children[randomIdx];
                path.addVertex(node);
                children = graph.getChildren(node);
                console.log('loop: ', {
                    node: node,
                    'end?': node !== end,
                    'children?': children.length > 0,
                    'too long?' :path.edges.length <= options.maxLength,
                    result: node && node !== end && children.length > 0 && path.edges.length <= options.maxLength
                });
            }
        }
        console.log('path: ', path);
        return path;
    };

    return GraphAlgorithms;
});