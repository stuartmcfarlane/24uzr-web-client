define(['settings', 'models/edge', 'lodash'], function (settings, Edge) {
    'use strict';

    var defaultOptions = {

    };

    function GraphAdapter (options) {
        this.options = _.extend({}, defaultOptions, options || {});
        this.eventHandlers = [];
        this.sigma = initSigma();
        registerSigmaEventHandler('overnodes', this, this.onHoverInVertex);
        registerSigmaEventHandler('outnodes', this, this.onHoverOutVertex);
        registerSigmaEventHandler('upnodes', this, this.onClickVertex);
    }

    function initSigma(adapter) {
        var sigRoot = document.getElementById(settings.graphAdapter.target);
        var sigmaInst = sigma.init(sigRoot);
        sigmaInst
        .drawingProperties(settings.sigma.drawingProperties)
        .graphProperties(settings.sigma.graphProperties)
        .mouseProperties(settings.sigma.mouseProperties);
        return sigmaInst;
    }

    function registerSigmaEventHandler(eventName, adapter, method) {
        adapter.sigma.bind(eventName, function handleEvent() {
            method.apply(adapter, arguments);
        });
    }

    function fireEvent(adapter, event, data) {
        if (adapter.eventHandlers) {
            adapter.eventHandlers.forEach(function fire(handler) {
                if (handler.fn[event]) {
                    handler.fn[event].apply(handler.target, data);
                }
            });
        }
    }

    // sigma events
    GraphAdapter.prototype.onHoverInVertex = function onHoverInVertex(event) {
    };

    GraphAdapter.prototype.onHoverOutVertex = function onHoverOutVertex(event) {
    };

    GraphAdapter.prototype.onClickVertex = function onClickVertex(event) {
        var node;
        event.target.iterNodes(function(n){
            node = n;
        },[event.content[0]]);
        var vertex = this.graph.findVertexById(node.id);
        this.onBouySelected(vertex);
    };

    GraphAdapter.prototype.onBouySelected = function onBouySelected(bouy) {
        this.setActiveBouy(bouy);
        fireEvent(this, 'onBouySelected', [bouy]);
    };

    // public
    GraphAdapter.prototype.setGraph = function setGraph(graph) {
        this.graph = graph;
    };

    GraphAdapter.prototype.setActive = function setActive(active) {
        this.active = active;
    };

    GraphAdapter.prototype.registerEventHandlers = function registerEventHandlers(target, eventHandlers) {
        this.eventHandlers.push({
            target: target,
            fn: eventHandlers
        });
    };

    GraphAdapter.prototype.clear = function clear() {
        this.sigma.emptyGraph();
        this.graph.clear();
    };

    GraphAdapter.prototype.graph2sigma = function graph2sigma(vertex, node) {
        return _.extend(node || {}, {
            label: vertex.name,
            color: vertex.color || settings.graph.defaultVertexColor,
                // x = latitude, y = -longitude
                // scale up sigma scale
            x: vertex.location.lon * 100,
            y: vertex.location.lat * -100
        });
    };

    GraphAdapter.prototype.addBouy = function addBouy(vertices) {
        try {
            if (angular.isArray(vertices)) {
                var that = this;
                vertices.forEach(function(vertex){
                    that.addBouy.call(that, vertex);
                });
            }
            else {
                var vertex = vertices;
                this.sigma.addNode(vertex._id, this.graph2sigma(vertex));
            }
        }
        catch(error) {
        }
    };

    GraphAdapter.prototype.updateBouy = function updateBouy(vertices) {
        if (angular.isArray(vertices)) {
            var that = this;
            vertices.forEach(function(vertex){
                that.updateBouy.call(that, vertex);
            });
        }
        else {
            var vertex = vertices;
            var that = this;
            this.sigma.iterNodes(function updateNode(node) {
                that.graph2sigma(vertex, node);
            }, [vertex._id]);
        }
    };

    GraphAdapter.prototype.removeLeg = function removeLeg(edges) {
        if (angular.isArray(edges)) {
            var that = this;
            edges.forEach(function(edge){
                that.removeLeg.call(that, edge);
            });
        }
        else {
            var edge = edges;
            this.sigma.dropEdge(edge._id);
        }
    };

    function m2knots(m) {
        return m * 1.94384617178935;
    }

    GraphAdapter.prototype.makeEdgeLabel = function makeEdgeLabel(edge) {
        var label = edge.start.name + ' - ' + edge.end.name + ' : ' + m2knots(edge.getLengthMeters());
        return label;
    };

    GraphAdapter.prototype.addLeg = function addLeg(edges) {
        try {
            if (angular.isArray(edges)) {
                var that = this;
                edges.forEach(function(edge){
                    that.addLeg.call(that, edge);
                });
            }
            else {
                var edge = edges;
                this.sigma.addEdge(edge._id, edge.start._id, edge.end._id, {
                    label: this.makeEdgeLabel(edge)
                });
            }
        }
        catch (error) {
        }
    };

    GraphAdapter.prototype.removeBouy = function removeBouy(bouys) {
        if (angular.isArray(bouys)) {
            var that = this;
            bouys.forEach(function(bouys){
                that.removeBouy.call(that, bouys);
            });
        }
        else {
            var bouy = bouys;
            this.sigma.dropNode(bouy._id);
        }
    };

    GraphAdapter.prototype.drawBouys = function drawBouys() {
        var bouys = this.graph.vertices.map(function getId(bouy) {
            return bouy._id;
        });
        try {
            this.sigma.iterNodes(function setBouyProperties(node) {
                node.color = settings.graph.defaultBouyColor;
                node.size = settings.graph.defaultBouySize;
            }, bouys);
        }
        catch (error) {
        }
    };
    
    GraphAdapter.prototype.drawLegs = function drawLegs() {
        var legs = this.graph.edges.map(function getId(leg) {
            return leg._id;
        });
        try {
            this.sigma.iterEdges(function setLegProperties(node) {
                node.color = settings.graph.defaultLegColor;
            }, legs);
        }
        catch (error) {
        }
    };

    GraphAdapter.prototype.drawCurrentLeg = function drawCurrentLeg() {
        this.sigma.dropEdge('currentLeg');
        try {
            if (this.active.leg.start) {
                this.sigma.iterNodes(function(node) {
                    node.color = settings.graph.startBouyColor;
                    node.size = settings.graph.startBouySize;
                }, [this.active.leg.start._id]);
            }
            if (this.active.leg.end) {
                this.sigma.iterNodes(function(node) {
                    node.color = settings.graph.endBouyColor;
                    node.size = settings.graph.endBouySize;
                }, [this.active.leg.end._id]);
            }
        }
        catch (error) {
        }
    };

    GraphAdapter.prototype.drawCurrentBouy = function drawCurrentBouy() {
        if (this.active && this.active.bouy) {
            this.sigma.iterNodes(function highlightCurrentBouy (node) {
                node.color = settings.graph.currentBouyColor;
                node.size = settings.graph.currentBouySize;
            }, [this.active.bouy._id]);
        }
    };

    GraphAdapter.prototype.setActiveBouy = function setActiveBouy(bouy) {
        settings.debug && console.log('setActiveBouy', bouy, this.active);
        this.active.bouy = bouy;
        if (!this.active.leg) {
            this.active.leg = new Edge({
                start: undefined,
                end: bouy
            });
        }
        else {
            this.active.leg.start = this.active.leg.end;
            this.active.leg.end = bouy;
        }
    };

    GraphAdapter.prototype.setActivePath = function setActivePath(path) {
        var sigma = this.sigma;
        if (this.active.path) {
            this.active.path.edges.forEach(function removeActiveEdge(edge) {
                sigma.dropEdge(edge._id);
            });
        }
        this.active.path = path;
        if (this.active.path) {
            var nextId = 0;
            this.active.path.edges.forEach(function addEdge(edge) {
                edge._id = 'activePath.' + (++nextId);
                sigma.addEdge(edge._id, edge.start._id, edge.end._id);
            });

            this.sigma.iterEdges(function activeEdgesBlue(edge) {
                edge.color = settings.graph.activePathColor;
            }, path.edges.map(function getEdgeIds(edge) { return edge._id; }));
        }
        this.redraw();
    };

    GraphAdapter.prototype.showEdgeHistogram = function showEdgeHistogram() {
        if (this.active.edgeHistogram) {
            console.log('showHistograp')
            var sigma = this.sigma;
            var nextId = 0;
            var histogram = {};
            var min = 0;
            var max = 0;
            this.active.edgeHistogram.forEach(function addEdge(edge) {
                histogram[edge._id] = edge.count;
                if (edge.count > max) {
                    max = edge.count;
                }
                if (edge.count < min) {
                    min = edge.count;
                }
                sigma.addEdge(edge._id, edge.start._id, edge.end._id);
            });

            this.sigma.iterEdges(function activeEdgesBlue(edge) {
                edge.color = settings.edgeHistogram.gradient.getColor(min, max, histogram[edge.id]);
                edge.size = settings.edgeHistogram.gradient.getSize(min, max, histogram[edge.id]);
            }, this.active.edgeHistogram.map(function getEdgeIds(edge) { return edge._id; }));
            this.redraw();
        }
    };

    GraphAdapter.prototype.hideEdgeHistogram = function hideEdgeHistogram() {
        var sigma = this.sigma;
        if (this.active.edgeHistogram) {
            this.active.edgeHistogram.forEach(function removeActiveEdge(edge) {
                sigma.dropEdge(edge._id);
            });
            this.redraw();
        }
    };

    GraphAdapter.prototype.setEdgeHistogram = function setEdgeHistogram(edges) {
        this.active.edgeHistogram = edges;
    };

    function dumpSigma (m, s) {
        s.iterNodes(function(n){ settings.debug && console.log(m, n.label);});
        s.iterEdges(function(e){ 
            var n1, n2;
            s.iterNodes(function(n){ n1 = n;}, [e.source]); 
            s.iterNodes(function(n){ n2 = n; }, [e.target]);
            settings.debug && console.log(m, n1.label + ' -> ' + n2.label);
        });
    }

    GraphAdapter.prototype.redraw = function redraw() {
        settings.debug && console.log('redraw');
        dumpSigma('redraw', this.sigma);
        this.drawBouys();
        this.drawLegs();
        this.drawCurrentBouy();
        this.drawCurrentLeg();
        this.sigma.draw();
    };

    return GraphAdapter;
});