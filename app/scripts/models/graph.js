define(['settings', './bouy', './edge', 'underscore'], function (settings, Bouy, Edge) {
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

    Graph.prototype.clear = function clear() {
        // settings.debug && console.log('Graph.clear');
        this.vertices = [];
        this.edges = [];
    };

    Graph.prototype.addVertex = function addVertex(vertex) {
        // settings.debug && console.log('Graph.addVertex', vertex);
        var that = this;
        if (angular.isArray(vertex)) {
            vertex.forEach(function addVertexElement(vertex) {
                that.addVertex(vertex);
            });
        }
        else {
            if (!(vertex instanceof Bouy)) {
                vertex = new Bouy(vertex);
            }
            this.vertices.push(vertex);
        }
        return this;
    };

    Graph.prototype.addEdge = function addEdge(edge) {
        // settings.debug && console.log('Graph.addEdge', edge);
        var that = this;
        if (angular.isArray(edge)) {
            edge.forEach(function addEdgeElement(edge) {
                that.addEdge(edge);
            });
        }
        else {
            if (! (edge instanceof Edge)) {
                var start = this.findVertexById(edge.start);
                var end = this.findVertexById(edge.end);
                if (!start || !end) {
                    // settings.debug && console.log('Edge not added: No id');
                    return this;
                }
                edge = new Edge(
                    start,
                    end
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

    Graph.prototype.findVertexById = function findVertexById(vertexId) {
        // settings.debug && console.log('Graph.findVertexById', vertexId);
        var found = this.vertices.filter(function filterOnId(vertex) {
            return vertexId === vertex._id;
        });
        if (found.length) {
            return found[0];
        }
    };

    Graph.prototype.findVertexByName = function findVertexByName(vertexName) {
        // settings.debug && console.log('Graph.findVertexByName', vertexName);
        var found = this.vertices.filter(function filterOnName(vertex) {
            return vertexName === vertex.name;
        });
        if (found.length) {
            return found[0];
        }
    };

    Graph.prototype.countEdges = function countEdges(start, end) {
        // settings.debug && console.log('Graph.countEdges', start, end);
        var count = this.edges.reduce(function countMatchingEdged(count, edge) {
            if (edge.start === start._id && edge.end === end._id) {
                return count + 1;
            }
            return count;
        }, 0);
        return count;
    };

    Graph.prototype.getChildren = function getChildren(vertex) {
        // settings.debug && console.log('Graph.getChildren', vertex);
        var children = [];
        this.edges.forEach(function getChild(edge) {
            if (edge.start === vertex) {
                children.push(edge.end);
            }
        });
        return children;
    };

    Graph.prototype.getParents = function getParents(vertex) {
        // settings.debug && console.log('Graph.getParents', vertex);
        var parents = [];
        this.edges.forEach(function getChild(edge) {
            if (edge.start === vertex) {
                parents.push(edge.start);
            }
        });
        return parents;
    };

    Graph.prototype.getEdgesTo = function getEdgesTo(vertex) {
        // settings.debug && console.log('Graph.getEdgesTo', vertex);
        return this.edges.filter(function filterTo(edge) {
            return edge.end === vertex;
        });
    };

    Graph.prototype.getEdgesFrom = function getEdgesFrom(vertex) {
        // settings.debug && console.log('Graph.getEdgesFrom', vertex);
        return this.edges.filter(function filterTo(edge) {
            return edge.start === vertex;
        });
    };

    Graph.prototype.getEdgesToAndFrom = function getEdgesToAndFrom(vertex) {
        // settings.debug && console.log('Graph.getEdgesToAndFrom', vertex);
        var to = this.getEdgesTo(vertex);
        var from = this.getEdgesFrom(vertex);
        return to.concat(from);
    };

    return Graph;
});