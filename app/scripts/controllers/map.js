define(['app', 'models/bouy', 'models/graph', 'models/edge'], function (app, Bouy, Graph, Edge) {
    'use strict';

    function MapController($scope, ApiService) {
        this.graph = new Graph();
        this.currentBouy = new Bouy();
        this.startBouy = new Bouy();
        this.endBouy = undefined;
        this.sigma = initSigma();
        this.apiService = ApiService;
        this.scope = $scope;
        var that = this;

        $scope.startBouy = {name: 'test'} ;

        function onHoverInBouy(event) {
            console.log('sdm: in', event);
        };

        function onHoverOutBouy(event) {
            console.log('sdm: out', event);
        };
        
        function onClickBouy(event) {
            var node;
            event.target.iterNodes(function(n){
                node = n;
            },[event.content[0]]);
            console.log('sdm: click', event, node.id, node.label);
            that.onBouySelected(node);
        };
        
        function addEvents(sigmaInst) {
            sigmaInst.bind('overnodes', onHoverInBouy);
            sigmaInst.bind('outnodes', onHoverOutBouy);
            sigmaInst.bind('upnodes', onClickBouy);
        };
        addEvents(this.sigma);

        this.onBouysLoaded = function onBouysLoaded(event, bouys) {
            that.graph.addVertex(bouys);
            that.addVertexToSigma(bouys);
        };

        this.onBouyCreated = function onBouyCreated(event, bouy) {
            that.graph.addVertex(bouy);
            that.addVertexToSigma(bouy);
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
                defaultLabelColor: '#fff',
                defaultLabelSize: 14,
                defaultLabelBGColor: '#fff',
                defaultLabelHoverColor: '#000',
                labelThreshold: 6,
                defaultEdgeType: 'straight'
            }).graphProperties({
                minNodeSize: 0.5,
                maxNodeSize: 5,
                minEdgeSize: 1,
                maxEdgeSize: 1,
                sideMargin: 50
            }).mouseProperties({
                maxRatio: 32
            });
            return sigmaInst;
        };

        $scope.map = this;
        this.fixFocus();
    };

    MapController.prototype.addVertexToSigma = function addVertexToSigma(bouys, depth) {
        if (depth === undefined) {
            depth = 0;
        }
        if (typeof bouys !== 'array' && bouys.length == undefined) {
            this.sigma.addNode(bouys._id,{
                label: bouys.name,
                color: '#00ff00',
                x: bouys.location.x,
                y: bouys.location.y
            });
        }
        else {
            var that = this;
            bouys.forEach(function(bouys, idx){
                var bouy = bouys[idx];
                that.addVertexToSigma.call(that, bouys, depth + 1);
            });
        }
        if (!depth) {
            this.sigma.draw();
        }
    };

    MapController.prototype.addEdgeToSigma = function addEdgeToSigma(legs, depth) {
        if (depth === undefined) {
            depth = 0;
        }
        if (typeof legs !== 'array' && legs.length == undefined) {
            this.sigma.addEdge(legs._id, legs.start, legs.end);
        }
        else {
            var that = this;
            legs.forEach(function(legs, idx){
                var leg = legs[idx];
                that.addEdgeToSigma.call(that, legs, depth + 1);
            });
        }
        if (!depth) {
            this.sigma.draw();
        }
    };

    MapController.prototype.fixFocus = function fixFocus() {
        var bouyName = document.getElementById('bouy-name');
        bouyName && bouyName.focus();
    }

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

    MapController.prototype.onBouySelected = function onBouySelected(node) {
        this.scope.endBouy = this.scope.startBouy;
        var bouy = new Bouy();
        bouy._id = node.id;
        bouy.name = node.label;
        bouy.location = {
            x: node.x,
            y: node.y
        }
        this.scope.startBouy = bouy;
        this.scope.$apply();
    };

    MapController.prototype.addLeg = function addLeg() {
        var startBouy = this.scope.startBouy;
        var endBouy = this.scope.endBouy;
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

    app.controller('Map', ['$scope', 'ApiService', MapController]);
});