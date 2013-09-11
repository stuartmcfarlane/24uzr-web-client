define(['settings', './graph', './edge'], function (settings, Graph, Edge) {
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
            this.length = this.edges.length;
        }
        return this;
    };

    Path.prototype.prependVertex = function prependVertex(vertex) {
        var that = this;
        if (angular.isArray(vertex)) {
            vertex.forEach(function prependVertexElement(vertex) {
                that.prependVertex(vertex);
            });
        }
        else {
            if (this.vertices.length) {
                settings.debug && console.log('prepend edge', vertex.name, this.vertices[0].name);
                this.edges.unshift(new Edge({
                    start: vertex,
                    end: this.vertices[0]
                }));
            }
            settings.debug && console.log('prepend vertex', vertex.name);
            this.vertices.unshift(vertex);
            this.length = this.edges.length;
        }
        return this;
    };

    Path.prototype.getLengthMeters = function getLengthMeters() {
        return this.edges.reduce(function sumEdgeLengths(length, edge) {
            return length + edge.getLengthMeters();
        }, 0);
    };

    return Path;
});