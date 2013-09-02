define(['app', 'models/bouy', 'models/graph', 'models/edge'], function (app, Bouy, Graph, Edge) {
    'use strict';

    function MapController($scope, ApiService) {
        this.graph = new Graph();
        this.currentBouy = undefined;
        this.startBouy = undefined;
        this.endBouy = undefined;
        this.sigma = initSigma();
        this.apiService = ApiService;
        this.scope = $scope;
        var that = this;

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

        addEvents(this.sigma);

        this.onBouysLoaded = function onBouysLoaded(event, bouys) {
            that.graph.addVertex(bouys);
            that.addVertexToSigma(bouys);
        };

        this.onBouyCreated = function onBouyCreated(event, bouy) {
            that.graph.addVertex(bouy);
            that.addVertexToSigma(bouy);
        };

        this.onBouyUpdated = function onBouyUpdated(event, bouy) {
            that.updateVertexToSigma(bouy);
        };

        this.onLegsLoaded = function onLegsLoaded(event, legs) {
            that.graph.addEdge(legs);
            that.addEdgeToSigma(legs);
        };

        this.onLegsCreated = function onLegCreated(event, leg) {
            that.graph.addEdge(leg);
            that.addEdgeToSigma(leg);
        };

        $scope.$on('bouy:created', this.onBouyCreated);
        $scope.$on('bouy:updated', this.onBouyUpdated);
        $scope.$on('bouy:queried', this.onBouysLoaded);
        $scope.$on('leg:created', this.onLegsCreated);
        $scope.$on('leg:queried', this.onLegsLoaded);

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
            sigmaInst.drawingProperties({
                borderSize: 5,
                arrowRatio: 100,
                defaultLabelColor: '#ddd',
                defaultLabelSize: 14,
                defaultLabelBGColor: '#ddd',
                defaultLabelHoverColor: '#000',
                labelThreshold: 6,
                defaultEdgeType: 'line',
                defaultEdgeArrow: 'target',
            }).graphProperties({
                arrowDisplaySize: 10,
                sideMargin: 20,
                minNodeSize: 0.5,
                maxNodeSize: 5,
                minEdgeSize: 1,
                maxEdgeSize: 1,
            }).mouseProperties({
                maxRatio: 32
            });
            return sigmaInst;
        }

        $scope.map = this;
        this.fixFocus();
    }

    MapController.prototype.addVertexToSigma = function addVertexToSigma(bouys, depth) {
        if (depth === undefined) {
            depth = 0;
        }
        if (angular.isArray(bouys)) {
            var that = this;
            bouys.forEach(function(bouy){
                that.addVertexToSigma.call(that, bouy, depth + 1);
            });
        }
        else {
            this.sigma.addNode(bouys._id,{
                label: bouys.name,
                color: '#00ff00',
                x: bouys.location.x,
                y: bouys.location.y
            });
        }
        if (!depth) {
            this.redrawSigma();
        }
    };

    MapController.prototype.updateVertexToSigma = function updateVertexToSigma(bouys, depth) {
        if (depth === undefined) {
            depth = 0;
        }
        if (angular.isArray(bouys)) {
            var that = this;
            bouys.forEach(function(bouy){
                that.updateVertexToSigma.call(that, bouy, depth + 1);
            });
        }
        else {
            var bouy = bouys;
            this.sigma.iterNodes(function updateNode(node) {
                node.label = bouy.name;
                node.color = '#00ff00';
                node.x = bouy.location.x;
                node.y = bouy.location.y;
            }, [
                bouy._id
            ]);
        }
        if (!depth) {
            this.redrawSigma();
        }
    };

    MapController.prototype.addEdgeToSigma = function addEdgeToSigma(legs, depth) {
        if (depth === undefined) {
            depth = 0;
        }
        if (angular.isArray(legs)) {
            var that = this;
            legs.forEach(function(leg){
                that.addEdgeToSigma.call(that, leg, depth + 1);
            });
        }
        else {
            this.sigma.addEdge(legs._id, legs.start, legs.end);
        }
        if (!depth) {
            this.redrawSigma();
        }
    };

    MapController.prototype.showCurrentLeg = function showCurrentLeg(node) {
        this.sigma.dropEdge('currentLeg');
        if (this.startBouy && this.endBouy) {
            this.sigma.addEdge('currentLeg', this.startBouy._id, this.endBouy._id);
            this.sigma.iterEdges(function(edge) {
                edge.color = '#ff0';
            }, ['currentLeg']);
            this.sigma.iterNodes(function(node) {
                node.color = '#0f0';
            }, [this.startBouy._id]);
            this.sigma.iterNodes(function(node) {
                node.color = '#f00';
            }, [this.endBouy._id]);
        }
    };

    MapController.prototype.showCurrentBouy = function showCurrentBouy(node) {
        this.sigma.dropNode('currentBouy');
        if (this.currentBouy) {
            this.sigma.addNode('currentBouy', {
                label: this.currentBouy.name,
                x: this.currentBouy.location.x,
                y: this.currentBouy.location.y,
                color: '#ff0',
            });
        }

    };

    MapController.prototype.redrawSigma = function redrawSigma() {
        this.showCurrentLeg();
        this.showCurrentBouy();
        this.sigma.iterEdges(function setArrowSizes (edge) {
            edge.arrowDisplaySize = 50;
        })
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
            this.currentBouy = new Bouy();
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

    MapController.prototype.setLegBouys = function setLegBouys(node) {
        if (node && (!this.endBouy || node.id !== this.endBouy._id)) {
            this.startBouy = this.endBouy;
            var bouy = new Bouy();
            bouy._id = node.id;
            bouy.name = node.label;
            bouy.location = {
                x: node.x,
                y: node.y
            };    
            this.endBouy = bouy;
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
    
    MapController.prototype.addLeg = function addLeg(startBouy, endBouy) {
        if (startBouy && endBouy) {
            var leg = new Edge();
            var scope = this.scope;
            leg.start = startBouy._id;
            leg.end = endBouy._id;
            this.apiService.create('legs', leg).then(function(leg){
                scope.$broadcast('leg:created', leg);
            });
        }
    };

    MapController.prototype.addSingleLeg = function addSingleLeg() {
        this.addLeg(this.startBouy, this.endBouy);
    };

    MapController.prototype.addDuplexLeg = function addDuplexLeg() {
        this.addLeg(this.startBouy, this.endBouy);
        this.addLeg(this.endBouy, this.startBouy);
    };

    app.controller('Map', ['$scope', 'ApiService', MapController]);
});