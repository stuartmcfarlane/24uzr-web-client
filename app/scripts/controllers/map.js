define(['app', 'models/bouy', 'models/graph'], function (app, Bouy, Graph) {
    'use strict';

    function MapController($scope, UserService, ApiService) {
        this.graph = new Graph();
        this.currentBouy = new Bouy();
        this.sigma = initSigma();
        this.apiService = ApiService;
        this.scope = $scope;
        var that = this;

        this.onBouysLoaded = function onBouysLoaded(event, bouys) {
            that.graph.addVertex(bouys);
            that.addVertexToSigma(bouys);
        };

        this.onBouyCreated = function onBouyCreated(event, bouy) {
            that.graph.addVertex(bouy);
            that.addVertexToSigma(bouy);
        };

        $scope.$on('bouy:created', this.onBouyCreated);
        $scope.$on('bouy:queried', this.onBouysLoaded);

        this.apiService.query('bouies')
        .then(function bouysQuerySuccess(bouys) {
            $scope.$broadcast('bouy:queried', bouys);
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

    MapController.prototype.addEdgeToSigma = function addEdgeToSigma(edge) {
        this.sigma.addEdge(edge._id, edge.start._id, edge.end._id);
        this.sigma.draw();
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
        // this.apiService.create('bouies', bouy).then(function(bouy) {
        //     this.graph.addVertex(bouy);
        //     this.addVertexToSigma(bouy);
        // });
        var scope = this.scope;
        this.apiService.create('bouies', bouy).then(function(bouy) {
            scope.$broadcast('bouy:created', bouy);
        });
        this.fixFocus();
    };

    MapController.prototype.addLeg = function addLeg(leg) {
        this.graph.addEdge(leg);
        this.addEdgeToSigma(leg);
    };

    app.controller('Map', ['$scope', 'UserService', 'ApiService', MapController]);
});