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
        this.setectedPath = undefined;
        this.findAllPathsTime = 0;
        this.raceTime = settings.race.raceTime;
        this.windAngle = 45;
        this.windKnots = 20;
        this.ship = undefined;
        this.ships = [];
        this.paths = [];
        this.calculating = false;

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
            $scope.$broadcast('ship:queried', ships);
        });

        $scope.planner = this;
    }

    // graphAdapter events

    PlannerController.prototype.onBouySelected = function onBouySelected() {
        settings.debug.event && console.log('onBouySelected');
        this.findAllPaths();
    };

    PlannerController.prototype.onActiveLegChanged = function onActiveLegChanged() {
        settings.debug.event && console.log('onActiveLegChanged');
    };

    // model change events

    PlannerController.prototype.onPathLengthChanged = function onPathLengthChanged() {
        settings.debug.event && console.log('onPathLengthChanged');
        this.findAllPaths();
    };

    PlannerController.prototype.onRaceTimeChanged = function onRaceTimeChanged() {
        settings.debug.event && console.log('onRaceTimeChanged');
        this.findAllPaths();
    };

    PlannerController.prototype.onWindChanged = function onWindChanged() {
        settings.debug.event && console.log('onWindChanged');
        this.findAllPaths();
    };

    // button, hover events

    PlannerController.prototype.onClearPathPressed = function onClearPathPressed() {
        settings.debug.event && console.log('onClearPathPressed');
        this.graphAdapter.setActivePath();
    };

    PlannerController.prototype.onFindPathsPressed = function onFindPathsPressed() {
        settings.debug.event && console.log('onFindPathsPressed');
        this.findAllPaths();
    };

    PlannerController.prototype.onClickPathInList = function onClickPathInList(path) {
        settings.debug.event && console.log('onClickPathInList', path);
        var foundPath = this.findPath(path);
        if (foundPath && foundPath !== this.selectedPath) {
            this.selectedPath = foundPath;
            this.graphAdapter.setActivePath(foundPath);
            this.graphAdapter.hideEdgeHistogram();
        }
    };

    PlannerController.prototype.onDeselectPath = function onDeselectPath() {
        settings.debug.event && console.log('onDeselectPath');
        this.selectedPath = undefined;
        this.graphAdapter.setActivePath(undefined);
        this.graphAdapter.showEdgeHistogram();
    };

    PlannerController.prototype.onHoverLegInList = function onHoverLegInList(leg) {
        settings.debug.event && console.log('onHoverLegInList', leg);
        if (leg) {
            this.graphAdapter.setHighlightLeg(leg);
        }
        else {
            this.graphAdapter.setHighlightLeg(undefined);
        }
    };

    PlannerController.prototype.onHoverPathInList = function onHoverPathInList(path) {
        settings.debug.event && console.log('onHoverPathInList', path);
        if (path) {
            var foundPath = this.findPath(path);
            this.graphAdapter.setActivePath(foundPath);
            this.graphAdapter.hideEdgeHistogram();
        }
        else if (!this.selectedPath) {
            this.graphAdapter.setActivePath(undefined);
            this.graphAdapter.showEdgeHistogram();
        }
    };

    // button state helpers

    PlannerController.prototype.isExistingNode = function isExistingNode(node) {
        settings.debug.trace && console.log('isExistingNode', node);
        var id = node && node.id || this.active.bouy && this.active.bouy._id || undefined;
        return !!this.graph.findVertexById(id);
    };

    PlannerController.prototype.isAddingNode = function isAddingNode() {
        settings.debug.trace && console.log('isAddingNode');
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
        settings.debug.event && console.log('onBouysLoaded', event, bouys);
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
        settings.debug.event && console.log('onLegsLoaded', event, legs);
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
        settings.debug.event && console.log('onShipsLoaded', event, ships);
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

    PlannerController.prototype.findPath = function findPath(path) {
        var planner = this;
        var foundPath;
        if (path && path._id) {
            var foundPaths = planner.paths.filter(function pathWithId(somePath) {
                return somePath._id === path._id;
            });
            if (foundPaths) {
                foundPath = foundPaths[0];
            }
        }
        return foundPath;
    };

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
                settings.debug.trace && console.log('speed: ' + edge.start.name + '->' + edge.end.name + convert.mps2knots(mps) + ' knots');
                return mps;
            };
        };
        var speed = makeSpeedFn(this.ship, wind, planner.raceTime);

        planner.paths = undefined;
        planner.calculating = true;
        setTimeout(function allPaths() {
            planner.scope.$apply(function applyWrapper() {
                settings.debug.trace && console.log('doing work');
                var perfStartTime = performance.now();
                var paths;
                if (planner.active.leg && planner.active.leg.start && planner.active.leg.end && 
                    planner.windAngle && planner.windKnots &&
                    planner.ship && planner.raceTime)
                {
                    var raceTimeSeconds = planner.raceTime * 60 * 60;
                    paths = planner.graphAlgorithms.pathsWithTime(
                        planner.graph,
                        planner.active.leg.start,
                        planner.active.leg.end,
                        {
                            time: raceTimeSeconds,
                            speed: speed
                        });
                    settings.debug.trace && console.log('got paths');
                    var edgeHistogram = planner.graphAlgorithms.edgeHistogram(paths);
                    planner.graphAdapter.setEdgeHistogram(edgeHistogram);
                    planner.graphAdapter.showEdgeHistogram();
                    paths = planner.graphAlgorithms.lengthSortPaths(paths);
                    var pathIdx = 0;
                    paths = paths.map(function pathToObject(path) {
                        ++pathIdx;
                        return _.extend({}, path, {
                            _id: pathIdx,
                            name: 'path '+ pathIdx,
                            lengthNauticalMiles: convert.m2nm(path.lengthMeters)
                        });
                    });
                    planner.paths = paths;
                    planner.findAllPathsTime = ~~(performance.now() - perfStartTime);
                    planner.graphAdapter.redraw();
                }
                planner.calculating = false;
            });
        }, 10);
    };

    app.controller('Planner', ['$scope', 'ApiService', '$q', PlannerController]);
});