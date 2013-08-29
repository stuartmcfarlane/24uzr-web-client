define(['app', 'models/bouy', 'models/graph'], function (app, Bouy, Graph) {
    'use strict';

    function MapController($scope) {
        this.graph = new Graph();

        this.currentBouy = new Bouy();

        $scope.map = this;
    };

    MapController.prototype.addBouy = function addBouy(bouy) {
        if (bouy === undefined) {
            bouy = this.currentBouy;
            this.currentBouy = new Bouy();
        }
        this.graph.addVertex(bouy);
    };

    MapController.prototype.addLeg = function addLeg(leg) {
        this.graph.addEdge(leg);
    };

    app.controller('Map', ['$scope', MapController]);
});