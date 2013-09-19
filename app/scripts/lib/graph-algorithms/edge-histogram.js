define(['settings', 'models/path', 'models/edge', 'lodash'],
    function (settings, Path, Edge) {
    'use strict';

    var defaultOptions = {
        _id: settings.edgeHistogram._id
    };

    return function edgeHistogram(paths, options) {
        settings.debug.trace && console.log('>edgeHistogram', paths, options);
        options = _.extend({}, defaultOptions, options || {});
        var histogram = {};
        var nextId = 0;
        var edges = [];
        if (paths) {
            paths.forEach(function samplePath(path) {
                path.edges.forEach(function sampleEdge(edge) {
                    settings.debug.trace && console.log(' edgeHistogram: edge', edge);
                    var key = edge.start._id + edge.end._id;
                    if (!histogram[key]) {
                        histogram[key] = new Edge({
                            _id: '' + options._id + (++nextId),
                            start: edge.start,
                            end: edge.end
                        });
                        histogram[key].count = 0;
                        settings.debug.trace && console.log(' edgeHistogram: count', key, histogram[key].count);
                    }
                    histogram[key].count++;
                    settings.debug.trace && console.log(' edgeHistogram: count', key, histogram[key].count);
                });
            });
        }

        for (var key in histogram) {
            if (histogram.hasOwnProperty(key)) {
                edges.push(histogram[key]);
            }
        }
        settings.debug.trace && console.log('<edgeHistogram', edges);
        return edges;
    };
});