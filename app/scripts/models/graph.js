define([], function () {
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
    }

    Graph.prototype.addVertex = function addVertex(vertex) {
        var that = this;
        if (angular.isArray(vertex)) {
            vertex.forEach(function addVertexElement(vertex) {
                that.addVertex(vertex);
            });
        }
        else {
            this.vertices.push(vertex);
        }
    };

    Graph.prototype.findVertexById = function findVertex(vertexId) {
        var found = this.vertices.filter(function filterOnId(vertex) {
            return vertexId === vertex._id;
        });
        if (found.length) {
            return found[0];
        }
    };

    Graph.prototype.addEdge = function addEdge(edge) {
        this.edges.push(edge);
    };

    return Graph;
});