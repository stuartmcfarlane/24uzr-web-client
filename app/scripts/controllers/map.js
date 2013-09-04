define(['app',
    'settings',
    'models/bouy',
    'models/graph',
    'models/edge',
    'lib/graph-algorithms',
    'lib/graph-algorithms/random-path'],

    function (app, settings, Bouy, Graph, Edge, GraphAlgorithms, RandomPath) {
    'use strict';

    function MapController($scope, ApiService) {
        this.scope = $scope;
        var that = this;

        this.apiService = ApiService;
        this.graphAlgorithms = new GraphAlgorithms();
        this.graph = new Graph(settings.graph);
        this.currentBouy = undefined;
        this.startBouy = undefined;
        this.endBouy = undefined;
        this.activePath = undefined;
        this.sigma = initSigma();
        addEvents(this.sigma);

        function onHoverInBouy(event) {
        }

        function onHoverOutBouy(event) {
        }
        
        function onClickBouy(event) {
            var node;
            event.target.iterNodes(function(n){
                node = n;
            },[event.content[0]]);
            that.onBouySelected(node);
        }
        
        function addEvents(sigmaInst) {
            sigmaInst.bind('overnodes', onHoverInBouy);
            sigmaInst.bind('outnodes', onHoverOutBouy);
            sigmaInst.bind('upnodes', onClickBouy);
        }

        this.onBouysLoaded = function onBouysLoaded(event, bouys) {
            if (!angular.isArray(bouys)) {
                bouys = [bouys];
            }
            bouys = bouys.map(function constructBouys(bouy) {
                return new Bouy(bouy);
            });
            console.log('BouysLoaded', bouys);
            that.graph.addVertex(bouys);
            that.addVertexToSigma(bouys);
            that.redrawSigma();
        };

        this.onBouysCreated = function onBouysCreated(event, bouys) {
            if (!angular.isArray(bouys)) {
                bouys = [bouys];
            }
            bouys = bouys.map(function constructBouys(bouy) {
                return new Bouy(bouy);
            });
            console.log('BouysCreated', bouys);
            that.graph.addVertex(bouys);
            that.addVertexToSigma(bouys);
            that.redrawSigma();
        };

        this.onBouysUpdated = function onBouysUpdated(event, bouys) {
            if (!angular.isArray(bouys)) {
                bouys = [bouys];
            }
            bouys = bouys.map(function constructBouys(bouys) {
                return new Bouy(bouy);
            });
            console.log('BouyUpdated', bouys);
            that.updateVertexToSigma(bouys);
            that.redrawSigma();
        };

        this.onBouysDeleted = function onBouysDeleted(event, bouys) {
            if (!angular.isArray(bouys)) {
                bouys = [bouys];
            }
            bouys = bouys.map(function constructBouys(bouys) {
                return new Bouy(bouy);
            });
            console.log('BouysDeleted', bouys);
            that.sigma.emptyGraph();
            that.apiService.query('bouies')
            .then(function bouysQuerySuccess(bouys) {
                $scope.$broadcast('bouy:queried', bouys);
            });

            that.apiService.query('legs')
            .then(function legsQuerySuccess(legs) {
                $scope.$broadcast('leg:queried', legs);
            });

        };

        this.onLegsLoaded = function onLegsLoaded(event, legs) {
            if (!angular.isArray(legs)) {
                legs = [legs];
            }
            var graph = that.graph;
            legs = legs.map(function constructEdges(leg) {
                leg.start = graph.findVertexById(leg.start);
                leg.end = graph.findVertexById(leg.end);
                return new Edge(leg);
            });
            console.log('LegsLoaded', legs);
            that.graph.addEdge(legs);
            that.addEdgeToSigma(legs);
            that.redrawSigma();
        };

        this.onLegsCreated = function onLegsCreated(event, legs) {
            if (!angular.isArray(legs)) {
                legs = [legs];
            }
            var graph = that.graph;
            legs = legs.map(function constructEdges(leg) {
                leg.start = graph.findVertexById(leg.start);
                leg.end = graph.findVertexById(leg.end);
                return new Edge(leg);
            });
            console.log('LegsCreated', legs);
            that.graph.addEdge(legs);
            that.addEdgeToSigma(legs);
            that.redrawSigma();
        };

        this.onLegDeleted = function onLegDeleted(event, leg) {
            console.log('LegDeleted', leg);
        };

        $scope.$on('bouy:queried', this.onBouysLoaded);
        $scope.$on('bouy:created', this.onBouysCreated);
        $scope.$on('bouy:updated', this.onBouysUpdated);
        $scope.$on('bouy:deleted', this.onBouysDeleted);
        $scope.$on('leg:created', this.onLegsCreated);
        $scope.$on('leg:queried', this.onLegsLoaded);
        $scope.$on('leg:deleted', this.onLegsDeleted);

        this.apiService.query('bouies')
        .then(function bouysQuerySuccess(bouys) {
            $scope.$broadcast('bouy:queried', bouys);
        });

        this.apiService.query('legs')
        .then(function legsQuerySuccess(legs) {
            $scope.$broadcast('leg:queried', legs);
        });

        function initSigma() {
            var sigRoot = document.getElementById('sigma-canvas');
            var sigmaInst = sigma.init(sigRoot);
            sigmaInst
            .drawingProperties(settings.sigma.drawingProperties)
            .graphProperties(settings.sigma.graphProperties)
            .mouseProperties(settings.sigma.mouseProperties);
            return sigmaInst;
        }

        $scope.map = this;
        this.fixFocus();
    }

    MapController.prototype.addVertexToSigma = function addVertexToSigma(bouys) {
        try {
            if (angular.isArray(bouys)) {
                var that = this;
                bouys.forEach(function(bouy){
                    that.addVertexToSigma.call(that, bouy);
                });
            }
            else {
                var bouy = bouys;
                this.sigma.addNode(bouy._id,{
                    label: bouy.name,
                    color: bouy.color || settings.graph.defaultVertexColor,
                    x: bouy.location.x,
                    y: bouy.location.y
                });
            }
        }
        catch(error) {
        }
    };

    MapController.prototype.updateVertexToSigma = function updateVertexToSigma(bouys) {
        if (angular.isArray(bouys)) {
            var that = this;
            bouys.forEach(function(bouy){
                that.updateVertexFromSigma.call(that, bouy);
            });
        }
        else {
            var bouy = bouys;
            this.sigma.iterNodes(function updateNode(node) {
                node.label = bouy.name;
                node.color = bouy.color || settings.graph.defaultVertexColor;
                node.x = bouy.location.x;
                node.y = bouy.location.y;
            }, [
                bouy._id
            ]);
        }
    };

    MapController.prototype.removeEdgeFromSigma = function removeEdgeFromSigma(legs) {
        if (angular.isArray(legs)) {
            var that = this;
            legs.forEach(function(leg){
                that.removeEdgeFromSigma.call(that, leg);
            });
        }
        else {
            var leg = legs;
            this.sigma.dropEdge(leg._id);
        }
    };

    MapController.prototype.addEdgeToSigma = function addEdgeToSigma(legs) {
        try {
            if (angular.isArray(legs)) {
                var that = this;
                var sdm = legs;
                legs.forEach(function(leg){
                    that.addEdgeToSigma.call(that, leg);
                });
            }
            else {
                var leg = legs;
                this.sigma.addEdge(leg._id, leg.start._id, leg.end._id);
            }
        }
        catch (error) {
        }
    };

    MapController.prototype.removeVertexFromSigma = function removeVertexFromSigma(bouys) {
        if (angular.isArray(bouys)) {
            var that = this;
            bouys.forEach(function(bouy){
                that.removeVertexToSigma.call(that, bouy);
            });
        }
        else {
            var bouy = bouys;
            this.sigma.dropNode(bouy._id);
        }
    };

    MapController.prototype.drawBouys = function drawBouys() {
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
    
    MapController.prototype.drawLegs = function drawLegs() {
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

    MapController.prototype.drawCurrentLeg = function drawCurrentLeg() {
        this.sigma.dropEdge('currentLeg');
        try {
            if (this.startBouy) {
                this.sigma.iterNodes(function(node) {
                    node.color = settings.graph.startBouyColor;
                    node.size = settings.graph.startBouySize;
                }, [this.startBouy._id]);
            }
            if (this.endBouy) {
                this.sigma.iterNodes(function(node) {
                    node.color = settings.graph.endBouyColor;
                    node.size = settings.graph.endBouySize;
                }, [this.endBouy._id]);
            }
        }
        catch (error) {
        }
    };

    MapController.prototype.drawCurrentBouy = function drawCurrentBouy() {
        if (this.currentBouy) {
            this.sigma.iterNodes(function highlightCurrentBouy (node) {
                node.color = settings.graph.currentBouyColor;
                node.size = settings.graph.currentBouySize;
            }, [this.currentBouy._id]);
        }
    };

    MapController.prototype.redrawSigma = function redrawSigma() {
        this.drawBouys();
        this.drawLegs();
        this.drawCurrentBouy();
        this.drawCurrentLeg();
        this.sigma.draw();
    }

    MapController.prototype.fixFocus = function fixFocus() {
        var bouyName = document.getElementById('bouy-name');
        if (bouyName) {
            bouyName.focus();
        }
    };

    MapController.prototype.addBouy = function addBouy(bouy) {
        if (bouy === undefined) {
            bouy = this.currentBouy;
            this.currentBouy = undefined;
        }
        var scope = this.scope;
        this.apiService.create('bouies', bouy).then(function(bouy) {
            scope.$broadcast('bouy:created', bouy);
        });
        this.fixFocus();
    };

    MapController.prototype.isExistingNode = function isExistingNode(node) {
        var id = node && node.id || this.currentBouy && this.currentBouy._id || undefined;
        return !!this.graph.findVertexById(id);
    };

    MapController.prototype.isAddingNode = function isAddingNode() {
        return (this.currentBouy !== undefined &&
            !this.isExistingNode(this.currentBouy) &&
            this.currentBouy.name !== undefined &&
            /[^\s]/.test(this.currentBouy.name) &&
            this.currentBouy.location !== undefined &&
            this.currentBouy.location.x !== undefined &&
            /[^\s]/.test(this.currentBouy.location.x) &&
            this.currentBouy.location.y !== undefined &&
            /[^\s]/.test(this.currentBouy.location.y)
        );
    };

    MapController.prototype.editBouy = function editBouy(bouy) {
        if (bouy === undefined) {
            bouy = this.currentBouy;
        }
        var scope = this.scope;
        this.apiService.update('bouies', bouy).then(function(bouy) {
            scope.$broadcast('bouy:updated', bouy);
        });
        this.fixFocus();
    };

    MapController.prototype.deleteBouy = function editBouy(bouy) {
        if (bouy === undefined) {
            bouy = this.currentBouy;
            this.currentBouy = undefined;
            if (this.startBouy === bouy) {
                this.startBouy = undefined;
            }
            if (this.endBouy === bouy) {
                this.endBouy = undefined;
            }
        }
        var scope = this.scope;
        var apiService = this.apiService;
        var deletionPromises = [];
        this.sigma.iterEdges(function edgesOfNode(edge) {
            if (edge.id !== 'currentLeg' && ( edge.source === bouy._id || edge.target === bouy._id )) {
                deletionPromises.push(
                    apiService.remove('legs', edge.id)
                    .then(function legDeleted (leg) {
                        scope.$broadcast('leg:deleted', leg);
                    })
                );
            }
        });
        deletionPromises.push(
            apiService.remove('bouies', bouy._id)
            .then(function bouyDeleted (bouy) {
                scope.$broadcast('bouy:deleted', bouy);
            })
        );

        this.fixFocus();
    };

    MapController.prototype.setLegBouys = function setLegBouys(node) {
        if (node && (!this.endBouy || node.id !== this.endBouy._id)) {
            this.startBouy = this.endBouy;
            this.endBouy = this.graph.findVertexById(node.id);
        }
    };

    MapController.prototype.setCurrentBouy = function setCurrentBouy(node) {
        this.currentBouy = this.graph.findVertexById(node.id);
    };

    MapController.prototype.onBouySelected = function onBouySelected(node) {
        this.setLegBouys(node);
        this.setCurrentBouy(node);
        this.redrawSigma();
        this.scope.$apply();
    };

    MapController.prototype.onDeselectBouy = function onDeselectBouy() {
        this.currentBouy = undefined;
    };
    
    MapController.prototype.canAddLeg = function canAddLeg(start, end) {
        return (0 === this.graph.countEdges(start, end));
    };

    MapController.prototype.addLeg = function addLeg(startBouy, endBouy) {
        if (startBouy && endBouy) {
            if (this.canAddLeg(this.startBouy, this.endBouy)) { 
                var scope = this.scope;
                var leg = {
                    start: startBouy._id,
                    end: endBouy._id
                };
                this.apiService.create('legs', leg).then(function(leg){
                    scope.$broadcast('leg:created', leg);
                });
            }
        }
    };

    MapController.prototype.addSingleLeg = function addSingleLeg() {
        this.addLeg(this.startBouy, this.endBouy);
    };

    MapController.prototype.addDuplexLeg = function addDuplexLeg() {
        this.addLeg(this.startBouy, this.endBouy);
        this.addLeg(this.endBouy, this.startBouy);
    };

    MapController.prototype.setActivePath = function setActivePath(path) {
        var sigma = this.sigma;
        if (this.activePath) {
            this.activePath.edges.forEach(function removeActivePathEdge(edge) {
                sigma.dropEdge(edge._id);
            });
        }
        this.activePath = path;
        if (this.activePath) {
            var nextId = 0;
            this.activePath.edges.forEach(function removeActivePathEdge(edge) {
                edge._id = 'activePath.' + (++nextId);
            });
            this.addEdgeToSigma(this.activePath.edges);
            var activePathIds = this.activePath.edges.map(function getIds(edge) {
                return edge._id;
            });
            this.sigma.iterEdges(function activeEdgesBlue(edge) {
                edge.color = settings.graph.activePathColor;
            }, activePathIds);
        }
        this.redrawSigma();
    };

    MapController.prototype.onRandomPath = function onRandomPath() {
        this.setActivePath(this.graphAlgorithms.randomPath(this.graph, this.startBouy, this.endBouy));
    };

    MapController.prototype.onClearPath = function onClearPath() {
        this.setActivePath();
    };

    app.controller('Map', ['$scope', 'ApiService', MapController]);
});