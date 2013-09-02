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
            console.log('BouysLoaded', bouys);
            that.graph.addVertex(bouys);
            that.addVertexToSigma(bouys);
            that.redrawSigma();
        };

        this.onBouyCreated = function onBouyCreated(event, bouy) {
            console.log('BouyCreated', bouy);
            that.graph.addVertex(bouy);
            that.addVertexToSigma(bouy);
            that.redrawSigma();
        };

        this.onBouyUpdated = function onBouyUpdated(event, bouy) {
            console.log('BouyUpdated', bouy);
            that.updateVertexToSigma(bouy);
            that.redrawSigma();
        };

        this.onBouyDeleted = function onBouyDeleted(event, bouy) {
            console.log('BouyDeleted', bouy);
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
            console.log('LegsLoaded', legs);
            that.graph.addEdge(legs);
            that.addEdgeToSigma(legs);
            that.redrawSigma();
        };

        this.onLegsCreated = function onLegCreated(event, leg) {
            console.log('LegsCreated', leg);
            that.graph.addEdge(leg);
            that.addEdgeToSigma(leg);
            that.redrawSigma();
        };

        this.onLegDeleted = function onLegDeleted(event, leg) {
            console.log('LegDeleted', leg);
        };

        $scope.$on('bouy:queried', this.onBouysLoaded);
        $scope.$on('bouy:created', this.onBouyCreated);
        $scope.$on('bouy:updated', this.onBouyUpdated);
        $scope.$on('bouy:deleted', this.onBouyDeleted);
        $scope.$on('leg:created', this.onLegsCreated);
        $scope.$on('leg:queried', this.onLegsLoaded);
        $scope.$on('leg:deleted', this.onLegDeleted);

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

    MapController.prototype.addVertexToSigma = function addVertexToSigma(bouys) {
        try {
            if (angular.isArray(bouys)) {
                var that = this;
                bouys.forEach(function(bouy){
                    that.addVertexToSigma.call(that, bouy);
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
                node.color = '#00ff00';
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
                legs.forEach(function(leg){
                    that.addEdgeToSigma.call(that, leg);
                });
            }
            else {
                this.sigma.addEdge(legs._id, legs.start, legs.end);
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

    MapController.prototype.showCurrentLeg = function showCurrentLeg(node) {
        this.sigma.dropEdge('currentLeg');
        try {
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
        }
        catch (error) {
        }
    };

    MapController.prototype.showCurrentBouy = function showCurrentBouy() {
        var currentBouyId = this.currentBouy && this.currentBouy._id;
        this.sigma.iterNodes(function highlightCurrentBouy (node) {
            if (node.id === currentBouyId) {
                node.color = '#ff0';
            }
            else {
                node.color = '#0f0';
            }
        });
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
    
    MapController.prototype.canAddLeg = function canAddLeg(start, end) {
        return (0 === this.graph.countEdges(start, end));
    };

    MapController.prototype.addLeg = function addLeg(startBouy, endBouy) {
        if (startBouy && endBouy) {
            if (this.canAddLeg(this.startBouy, this.endBouy)) { 
                var leg = new Edge();
                var scope = this.scope;
                leg.start = startBouy._id;
                leg.end = endBouy._id;
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

    app.controller('Map', ['$scope', 'ApiService', MapController]);
});