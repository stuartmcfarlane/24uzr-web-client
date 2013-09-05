define([], function() {
    return {
        graphAdapter: {
            target: 'sigma-canvas'
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

            activePathColor: '#009',
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
                sideMargin: 20,
                minNodeSize: 0.5,
                maxNodeSize: 5,
                minEdgeSize: 1,
                maxEdgeSize: 3,
            },
            mouseProperties: {
                maxRatio: 32
            }
        }
    };
});