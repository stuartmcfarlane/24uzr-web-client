define(['models/point', 'models/edge'], function (Point, Edge) {
    'use strict';

    function Graph (vertices, edges) {
        if (vertices === undefined) {
            vertices = [];
        }
        if (edges === undefined) {
            edges = [];
        }
        this.vertices = vertices;
        this.edges = edges;
    };

    Graph.prototype.addVertex = function addVertex(vertex) {
        console.log(this);
        this.vertices.push(vertex);
    }

    Graph.prototype.addEdge = function addEdge(edge) {
        this.edges.push(edge);
    }

    return Graph;
});