define([], function() {
    return {
        api: {
            port: 8080
        },
        graphAdapter: {
            target: 'sigma-canvas'
        },

        debug: {
            trace: false,
            dsl: false,
            event: false
        },

        graph: {
            vertexInCardinality: 1,
            vertexOutCardinality: 1,
            defaultBouyColor: '#fc0',
            defaultBouySize: 5,

            currentBouyColor: '#fc0',
            currentBouySize: 10,

            defaultLegColor: '#fc0',
            currentLegColor: '#ff0',

            startBouyColor: '#0f0',
            startBouySize: 10,

            endBouyColor: '#f00',
            endBouySize: 10,

            activePathColor: '#0f0',
        },
        sigma: {
            drawingProperties: {
                borderSize: 5,
                arrowRatio: 100,
                defaultLabelColor: '#ddd',
                defaultLabelSize: 14,
                defaultLabelBGColor: '#ddd',
                defaultLabelHoverColor: '#000',
                labelThreshold: 6,
                defaultEdgeType: 'line',
                defaultEdgeArrow: 'target',
            },
            graphProperties: {
                arrowDisplaySize: 10,
                sideMargin: 5,
                minNodeSize: 0.5,
                maxNodeSize: 5,
                minEdgeSize: 1,
                maxEdgeSize: 3,
            },
            mouseProperties: {
                maxRatio: 32
            }
        },
        edgeHistogram: {
            _id: 'edgeHistogram',
            gradient: {
                getSize: function(min, max, n) {
                    var maxSize = 8;
                    return ~~(n * (maxSize / Math.abs(max - min)));
                },
                getColor: function(min, max, n) {
                    // var colors = [
                    //     '#0f0', '#0e0', '#0d0', '#0c0',
                    //     '#0b0', '#0a0', '#090', '#080',
                    //     '#070', '#060', '#050', '#040',
                    //     '#030', '#020', '#010', '#000'
                    // ];
                    var colors = [
                        '#bbb',
                        '#aaa',
                        '#999',
                        '#888',
                        '#777',
                        '#666',
                        '#555',
                        '#444',
                        '#333',
                        '#222',
                        '#111',
                        '#000',
                    ];
                    var i = ~~(n * ((colors.length - 1) / Math.abs(max - min)));
                    return colors[i];
                }
            },
        }
    };
});