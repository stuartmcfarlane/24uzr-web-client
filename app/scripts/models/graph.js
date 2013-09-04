define(['./edge', 'underscore'], function (Edge) {
    'use strict';

    var defaultOptions = {
        vertexInCardinality: 1,
        vertexOutCardinality: 1
    };

    function Graph (options) {
        this.options = _.extend({}, defaultOptions, options || {});
        this.vertices = [];
        this.edges = [];
    }

    Graph.prototype.addVertex = function addVertex(vertex) {
        var that = this;
        if (angular.isArray(vertex)) {
            vertex.forEach(function addVertexElement(vertex) {
                that.addVertex(vertex);
            });
        }
        else {
            if (!(vertex instanceof Bouy)) {
                vertex = new Bouy(bouy);
            }
            this.vertices.push(vertex);
        }
        return this;
    };

    Graph.prototype.addEdge = function addEdge(edge) {
        var that = this;
        if (angular.isArray(edge)) {
            edge.forEach(function addEdgeElement(edge) {
                that.addEdge(edge);
            });
        }
        else {
            if (! (edge instanceof Edge)) {
                edge = new Edge(
                    this.findVertexById(edge.start),
                    this.findVertexById(edge.end)
                );
            }
            if (!edge.start || !edge.end) {
                console.log('Edge not added: Edge\'s vertices don\'t exist');
            }
            else {
                if (this.getChildren(edge.start) >= this.options.vertexOutCardinality) {
                    console.log('Edge not added: Vertex out cardinality reached.');
                }
                else if (this.getParents(edge.end) >= this.options.vertexInCardinality) {
                    console.log('Edge not added: Vertex in cardinality reached.');
                }
                else {
                    this.edges.push(edge);
                }
            }
        }
        return this;
    };

    Graph.prototype.findVertexById = function findVertex(vertexId) {
        var found = this.vertices.filter(function filterOnId(vertex) {
            return vertexId === vertex._id;
        });
        if (found.length) {
            return found[0];
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

    Graph.prototype.getChildren = function getChildren(vertex) {
        var children = [];
        this.edges.forEach(function getChild(edge) {
            if (edge.start === vertex) {
                children.push(edge.end);
            }
        });
        return children;
    };

    Graph.prototype.getParents = function getParents(vertex) {
        var parents = [];
        this.edges.forEach(function getChild(edge) {
            if (edge.start === vertex) {
                parents.push(edge.start);
            }
        });
        return parents;
    };

    return Graph;
});