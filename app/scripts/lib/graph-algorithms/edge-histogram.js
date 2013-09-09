define(['settings', '../graph-algorithms', 'models/path', 'models/edge', 'underscore'],
    function (settings, GraphAlgorithms, Path, Edge) {
    'use strict';

    var defaultOptions = {
        _id: settings.edgeHistogram._id
    };

    GraphAlgorithms.prototype.edgeHistogram = function edgeHistogram(paths, options) {
        settings.debug && console.log('>edgeHistogram', paths, options);
        options = _.extend({}, defaultOptions, options || {});
        var histogram = {};
        var nextId = 0;
        var edges = [];
        if (paths) {
            paths.forEach(function samplePath(path) {
                settings.debug && console.log(' edgeHistogram: path ' + path.name, path);
                path.path.edges.forEach(function sampleEdge(edge) {
                    settings.debug && console.log(' edgeHistogram: edge', edge);
                    var key = edge.start._id + edge.end._id;
                    if (!histogram[key]) {
                        histogram[key] = new Edge({
                            _id: '' + options._id + (++nextId),
                            start: edge.start,
                            end: edge.end
                        });
                        histogram[key].count = 0;
                        settings.debug && console.log(' edgeHistogram: count', key, histogram[key].count);
                    }
                    histogram[key].count++;
                    settings.debug && console.log(' edgeHistogram: count', key, histogram[key].count);
                });
            });
        }

        for (var key in histogram) {
            if (histogram.hasOwnProperty(key)) {
                edges.push(histogram[key]);
            }
        }
        settings.debug && console.log('<edgeHistogram', edges);
        return edges;
    };

    return GraphAlgorithms;
});