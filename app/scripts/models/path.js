define(['./graph', './edge'], function (Graph, Edge) {
    'use strict';

    function Path () {
        Graph.apply(this);
        this.length = 0;
    }

    Path.prototype.addVertex = function addVertex(vertex) {
        var that = this;
        if (angular.isArray(vertex)) {
            vertex.forEach(function addVertexElement(vertex) {
                that.addVertex(vertex);
            });
        }
        else {
            if (this.vertices.length) {
                this.edges.push(new Edge({
                    start: this.vertices[this.vertices.length - 1],
                    end: vertex
                }));
            }
            this.vertices.push(vertex);
            this.length = this.vertices.length;
        }
        return this;
    };

    return Path;
});