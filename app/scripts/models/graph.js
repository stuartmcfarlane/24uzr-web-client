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
        var that = this;
        if (angular.isArray(edge)) {
            edge.forEach(function addEdgeElement(edge) {
                that.addEdge(edge);
            });
        }
        else {
            this.edges.push(edge);
        }
    };

    Graph.prototype.countEdges = function countEdges(start, end) {
        var count = this.edges.reduce(function countMatchingEdged(count, edge) {
            if (edge.start === start._id && edge.end === end._id) {
                return count + 1;
            }
            return count;
        }, 0);
        return count;
    };

    return Graph;
});