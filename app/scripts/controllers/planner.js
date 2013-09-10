/* Race planner controller
 *
 */

define(['app',
    'settings',
    'lib/convert',
    'lib/performance',
    'lib/graph-adapter',
    'models/bouy',
    'models/graph',
    'models/edge',
    'models/ship',
    'lib/graph-algorithms'],

    function (app, settings, convert, performance, GraphAdapter, Bouy, Graph, Edge, Ship, GraphAlgorithms) {
    'use strict';

    function PlannerController($scope, ApiService, $q) {
        this.scope = $scope;
        this.$q = $q;

        this.apiService = ApiService;
        this.graphAdapter = new GraphAdapter();
        this.graphAlgorithms = new GraphAlgorithms();
        this.graph = new Graph(settings.graph);

        this.active = {
            bouy: undefined,
            leg: undefined,
            path: undefined,
            edgeHistogram: undefined
        };
        this.findAllPathsTime = 0;
        this.raceTime = undefined;
        this.windAngle = 45;
        this.windKnots = 20;
        this.ship = undefined;
        this.ships = [];
        this.paths = [];

        this.graphAdapter.setGraph(this.graph);
        this.graphAdapter.setActive(this.active);
        this.graphAdapter.registerEventHandlers(this, {
            onBouySelected: this.onBouySelected
        });

        $scope.$on('bouy:queried', this.onBouysLoaded);
        $scope.$on('leg:queried', this.onLegsLoaded);
        $scope.$on('ship:queried', this.onShipsLoaded);

        this.apiService.query('bouies')
        .then(function bouysQuerySuccess(bouys) {
            $scope.$broadcast('bouy:queried', bouys);
        });

        this.apiService.query('legs')
        .then(function legsQuerySuccess(legs) {
            $scope.$broadcast('leg:queried', legs);
        });

        this.apiService.query('ships')
        .then(function shipsQuerySuccess(ships) {
            console.log('shipsQuerySuccess', ships);
            $scope.$broadcast('ship:queried', ships);
        });

        $scope.planner = this;
    }

    // graphAdapter events

    PlannerController.prototype.onActiveBouyChanged = function onActiveBouyChanged() {
        settings.debug && console.log('onActiveBouyChanged');
    };

    PlannerController.prototype.onActiveLegChanged = function onActiveLegChanged() {
        settings.debug && console.log('onActiveLegChanged');
    };

    // model change events

    PlannerController.prototype.onPathLengthChanged = function onPathLengthChanged() {
        settings.debug && console.log('onPathLengthChanged');
        this.findAllPaths();
    };

    PlannerController.prototype.onRaceTimeChanged = function onRaceTimeChanged() {
        settings.debug && console.log('onRaceTimeChanged');
        this.findAllPaths();
    };

    // button events

    PlannerController.prototype.onClearPathPressed = function onClearPathPressed() {
        settings.debug && console.log('onClearPathPressed');
        this.graphAdapter.setActivePath();
    };

    PlannerController.prototype.onFindPathsPressed = function onFindPathsPressed() {
        settings.debug && console.log('onFindPathsPressed');
        this.findAllPaths();
    };

    // button state helpers

    PlannerController.prototype.isExistingNode = function isExistingNode(node) {
        settings.debug && console.log('isExistingNode', node);
        var id = node && node.id || this.active.bouy && this.active.bouy._id || undefined;
        return !!this.graph.findVertexById(id);
    };

    PlannerController.prototype.isAddingNode = function isAddingNode() {
        settings.debug && console.log('isAddingNode');
        return (this.active.bouy !== undefined &&
            !this.isExistingNode(this.active.bouy) &&
            this.active.bouy.name !== undefined &&
            /[^\s]/.test(this.active.bouy.name) &&
            this.active.bouy.location !== undefined &&
            this.active.bouy.location.lon !== undefined &&
            /[^\s]/.test(this.active.bouy.location.lon) &&
            this.active.bouy.location.lon !== undefined &&
            /[^\s]/.test(this.active.bouy.location.lon)
        );
    };


    // api completion events

    PlannerController.prototype.onBouysLoaded = function onBouysLoaded(event, bouys) {
        settings.debug && console.log('onBouysLoaded', event, bouys);
        var planner = event.currentScope.planner;
        if (!angular.isArray(bouys)) {
            bouys = [bouys];
        }
        bouys = bouys.map(function constructBouys(bouy) {
            return new Bouy(bouy);
        });
        planner.graph.addVertex(bouys);
        planner.graphAdapter.addBouy(bouys);
        planner.setStartFinish();
        planner.graphAdapter.redraw();
    };

    PlannerController.prototype.onLegsLoaded = function onLegsLoaded(event, legs) {
        settings.debug && console.log('onLegsLoaded', event, legs);
        var planner = event.currentScope.planner;
        if (!angular.isArray(legs)) {
            legs = [legs];
        }
        var graph = planner.graph;
        legs = legs.map(function constructEdges(leg) {
            leg.start = graph.findVertexById(leg.start);
            leg.end = graph.findVertexById(leg.end);
            return new Edge(leg);
        });
        planner.graph.addEdge(legs);
        planner.graphAdapter.addLeg(legs);
        planner.graphAdapter.redraw();
    };

    PlannerController.prototype.onShipsLoaded = function onShipsLoaded(event, ships) {
        settings.debug && console.log('onShipsLoaded', event, ships);
        var planner = event.currentScope.planner;
        if (!angular.isArray(ships)) {
            ships = [ships];
        }
        ships = ships.map(function constructShips(ship) {
            return new Ship(ship);
        });
        planner.ships = ships;
        if (planner.ships.length) {
            planner.ship = planner.ships[0];
        }
    };

    // helpers

    PlannerController.prototype.setStartFinish = function setStartFinish() {
        if (!this.active.leg) {
            this.active.leg = {};
        }
        if (!this.active.leg.start) {
            this.active.leg.start = this.graph.findVertexByName('start');
        }
        if (!this.active.leg.end) {
            this.active.leg.end = this.graph.findVertexByName('finish');
        }
        if (!this.active.leg.start || !this.active.leg.end) {
            return;
        }
    };

    PlannerController.prototype.findAllPaths = function findAllPaths() {
        this.setStartFinish();
        var planner = this;
        var wind = function(edge, time) {
            return {
                angle: planner.windAngle,
                mag: convert.knots2mps(planner.windKnots)
            };
        };
        var makeSpeedFn = function makeSpeedFn(ship, wind, endTime) {
            return function speed(edge, timeToGo) {
                var time = endTime - timeToGo;
                var heading = planner.graphAlgorithms.edgeHeading(edge);
                var windVector = wind(edge.start.location, time);
                var mps = ship.getSpeed(heading, windVector);
                console.log('speed: ' + edge.start.name + '->' + edge.end.name + convert.mps2knots(mps) + ' knots');
                return mps;
            };
        };
        var speed = makeSpeedFn(this.ship, wind, planner.raceTime);

        setTimeout(function allPaths() {
            planner.scope.$apply(function applyWrapper() {
                settings.debug && console.log('doing work');
                var perfStartTime = performance.now();
                var paths;
                var raceTimeSeconds = planner.raceTime * 60 * 60;
                if (planner.active.leg && planner.active.leg.start && planner.active.leg.end && 
                    planner.windAngle && planner.windKnots &&
                    planner.ship) {
                    paths = planner.graphAlgorithms.pathsWithTime(
                        planner.graph,
                        planner.active.leg.start,
                        planner.active.leg.end,
                        {
                            time: raceTimeSeconds,
                            speed: speed
                        });
                    var pathIdx = 0;
                    paths = paths.map(function pathToObject(path) {
                        return {
                            name: ''+(++pathIdx),
                            path: path
                        };
                    });
                }
                settings.debug && console.log('got paths');
                planner.paths = paths;
                var edgeHistogram = planner.graphAlgorithms.edgeHistogram(paths);
                planner.graphAdapter.setEdgeHistogram(edgeHistogram);
                planner.findAllPathsTime = ~~(performance.now() - perfStartTime);
                planner.graphAdapter.redraw();
            });
        }, 10);
    };

    app.controller('Planner', ['$scope', 'ApiService', '$q', PlannerController]);
});