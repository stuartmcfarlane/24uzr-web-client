define(['app'], function (app) {
    'use strict';

    function Point (latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    };

    function MapController($scope) {
        this.graph = {
            vertices: [],
            edges: []
        };

        this.currentPoint = new Point(0,0);

        $scope.map = this;
    };

    MapController.prototype.addBouy = function addBouy(position) {
        if (position === undefined) {
            position = this.currentPoint;
            this.currentPoint = new Point(0,0);
        }
        this.graph.vertices.push(position);
    };

    MapController.prototype.addLeg = function addLeg(leg) {
        this.graph.edges.push(leg);
    };

    app.controller('Map', ['$scope', MapController]);
});