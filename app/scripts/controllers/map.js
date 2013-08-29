define(['app', 'models/bouy', 'models/graph'], function (app, Bouy, Graph) {
    'use strict';

    function MapController($scope) {
        this.graph = new Graph();
        this.currentBouy = new Bouy();
        this.sigma = initSigma();

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

    MapController.prototype.addVertexToSigma = function addVertexToSigma(bouy) {
        this.sigma.addNode(bouy._id,{
            label: bouy.name,
            color: '#00ff00',
            x: bouy.location.x,
            y: bouy.location.y
        });
        this.sigma.draw();
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
        this.graph.addVertex(bouy);
        this.addVertexToSigma(bouy);
        this.fixFocus();
    };

    MapController.prototype.addLeg = function addLeg(leg) {
        this.graph.addEdge(leg);
        this.addEdgeToSigma(leg);
    };

    app.controller('Map', ['$scope', MapController]);
});