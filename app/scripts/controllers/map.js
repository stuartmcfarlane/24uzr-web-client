/* Map Editor controller
 *
 * Directs map cntrolls to the graphAdapter which handles the drawing.
 * Creation of bouys and legs are submitted to the apiService from this
 * controller and on success are passed on to the graphAdapter for
 * rendering.
 *
 * All user interaction with sigma is handled by the graphAdapter and
 * routed back to this controller by way of events.
 *
 * TODO
 * User actions on the graph are first applied to the graphAdapter and
 * then persisted. This maintains the illusion of speed (even if it is
 * fast)
 *
 */

define(['app',
    'settings',
    'lib/performance',
    'lib/graph-adapter',
    'models/bouy',
    'models/graph',
    'models/edge'],

    function (app, settings, performance, GraphAdapter, Bouy, Graph, Edge) {
    'use strict';

    function MapController($scope, ApiService, $q) {
        this.scope = $scope;
        this.$q = $q;

        this.apiService = ApiService;
        this.graphAdapter = new GraphAdapter();
        this.graph = new Graph(settings.graph);

        this.active = {
            bouy: undefined,
            leg: undefined,
        };

        this.graphAdapter.setGraph(this.graph);
        this.graphAdapter.setActive(this.active);
        this.graphAdapter.registerEventHandlers(this, {
            onBouySelected: this.onBouySelected
        });

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

        $scope.map = this;
        this.fixFocus();
    }

    // graphAdapter events

    MapController.prototype.onActiveBouyChanged = function onActiveBouyChanged() {
        settings.debug.event && console.log('onActiveBouyChanged');
    };

    MapController.prototype.onActiveLegChanged = function onActiveLegChanged() {
        settings.debug.event && console.log('onActiveLegChanged');
    };

    // model change events

    // button events

    MapController.prototype.onAddBouyPressed = function onAddBouyPressed(bouy) {
        settings.debug.event && console.log('onAddBouyPressed', bouy);
        if (bouy === undefined) {
            bouy = new Bouy(this.active.bouy);
            this.graphAdapter.setActiveBouy(undefined);
        }
        var scope = this.scope;
        this.apiService.create('bouies', bouy).then(function(bouy) {
            scope.$broadcast('bouy:created', bouy);
        });
        this.fixFocus();
    };

    MapController.prototype.onEditBouyPressed = function onEditBouyPressed(bouy) {
        settings.debug.event && console.log('onEditBouyPressed', bouy);
        if (bouy === undefined) {
            bouy = new Bouy(this.active.bouy);
        }
        var scope = this.scope;
        this.apiService.update('bouies', bouy).then(function(bouy) {
            scope.$broadcast('bouy:updated', bouy);
        });
        this.fixFocus();
    };

    MapController.prototype.onDeleteBouyPressed = function onDeleteBouyPressed() {
        var bouy = this.active.bouy;
        settings.debug.event && console.log('onDeleteBouyPressed', bouy);
        if (bouy) {
            var toAndFrom = this.graph.getEdgesToAndFrom(bouy);
            var scope = this.scope;
            var apiService = this.apiService;

            this.graphAdapter.setActiveBouy(undefined);
            this.graphAdapter.removeLeg(toAndFrom);
            this.graphAdapter.removeBouy(bouy);
            this.graphAdapter.redraw();
            
            toAndFrom.forEach(function removeLinkedEdges(edge) {
                apiService.remove('legs', edge._id)
                .then(function() {
                    scope.$broadcast('leg:deleted', edge);
                });
            });
            apiService.remove('bouies', bouy._id)
            .then(function() {
                scope.$broadcast('bouy:deleted', bouy);
            });

            this.fixFocus();
        }
    };

    MapController.prototype.onDeselectBouyPressed = function onDeselectBouyPressed() {
        settings.debug.event && console.log('onDeselectBouyPressed');
        this.active.bouy = undefined;
        this.fixFocus();
    };
    
    MapController.prototype.onAddSingleLegPressed = function onAddSingleLegPressed() {
        settings.debug.event && console.log('onAddSingleLegPressed');
        this.addLeg(this.active.leg.start, this.active.leg.end);
    };

    MapController.prototype.onAddDuplexLegPressed = function onAddDuplexLegPressed() {
        settings.debug.event && console.log('onAddDuplexLegPressed');
        this.addLeg(this.active.leg.start, this.active.leg.end);
        this.addLeg(this.active.leg.end, this.active.leg.start);
    };

    // button state helpers

    MapController.prototype.isExistingNode = function isExistingNode(node) {
        settings.debug.trace && console.log('isExistingNode', node);
        var id = node && node.id || this.active.bouy && this.active.bouy._id || undefined;
        return !!this.graph.findVertexById(id);
    };

    MapController.prototype.isAddingNode = function isAddingNode() {
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

    MapController.prototype.onBouysLoaded = function onBouysLoaded(event, bouys) {
        settings.debug.event && console.log('onBouysLoaded', event, bouys);
        var map = event.currentScope.map;
        if (!angular.isArray(bouys)) {
            bouys = [bouys];
        }
        bouys = bouys.map(function constructBouys(bouy) {
            return new Bouy(bouy);
        });
        map.graph.addVertex(bouys);
        map.graphAdapter.addBouy(bouys);
        map.graphAdapter.redraw();
    };

    MapController.prototype.onBouysCreated = function onBouysCreated(event, bouys) {
        settings.debug.event && console.log('onBouysCreated', event, bouys);
        var map = event.currentScope.map;
        if (!angular.isArray(bouys)) {
            bouys = [bouys];
        }
        bouys = bouys.map(function constructBouys(bouy) {
            return new Bouy(bouy);
        });
        map.graph.addVertex(bouys);
        map.graphAdapter.addBouy(bouys);
        map.graphAdapter.redraw();
    };

    MapController.prototype.onBouysUpdated = function onBouysUpdated(event, bouys) {
        settings.debug.event && console.log('onBouysUpdated', event, bouys);
        var map = event.currentScope.map;
        if (!angular.isArray(bouys)) {
            bouys = [bouys];
        }
        bouys = bouys.map(function constructBouys(bouy) {
            return new Bouy(bouy);
        });
        map.graphAdapter.updateBouy(bouys);
        map.graphAdapter.redraw();
    };

    MapController.prototype.onBouysDeleted = function onBouysDeleted(event, bouys) {
        settings.debug.event && console.log('onBouysDeleted', event, bouys);
    };

    MapController.prototype.onLegsLoaded = function onLegsLoaded(event, legs) {
        settings.debug.event && console.log('onLegsLoaded', event, legs);
        var map = event.currentScope.map;
        if (!angular.isArray(legs)) {
            legs = [legs];
        }
        var graph = map.graph;
        legs = legs.map(function constructEdges(leg) {
            leg.start = graph.findVertexById(leg.start);
            leg.end = graph.findVertexById(leg.end);
            return new Edge(leg);
        });
        map.graph.addEdge(legs);
        map.graphAdapter.addLeg(legs);
        map.graphAdapter.redraw();
    };

    MapController.prototype.onLegsCreated = function onLegsCreated(event, legs) {
        settings.debug.event && console.log('onLegsCreated', event, legs);
        var map = event.currentScope.map;
        if (!angular.isArray(legs)) {
            legs = [legs];
        }
        var graph = map.graph;
        legs = legs.map(function constructEdges(leg) {
            leg.start = graph.findVertexById(leg.start);
            leg.end = graph.findVertexById(leg.end);
            return new Edge(leg);
        });
        map.graph.addEdge(legs);
        map.graphAdapter.addLeg(legs);
        map.graphAdapter.redraw();
    };

    MapController.prototype.onLegsDeleted = function onLegsDeleted(event, legs) {
        settings.debug.event && console.log('onLegsDeleted', event, legs);
    };

    MapController.prototype.fixFocus = function fixFocus() {
        settings.debug.trace && console.log('fixFocus');
        var bouyName = document.getElementById('bouy-name');
        if (bouyName) {
            bouyName.focus();
        }
    };

    // graph adapter events

    MapController.prototype.onBouySelected = function onBouySelected(bouy) {
        settings.debug.event && console.log('onBouySelected', bouy);
        this.scope.$apply();
    };

    // helpers

    MapController.prototype.canAddLeg = function canAddLeg(start, end) {
        settings.debug.trace && console.log('canAddLeg', start, end);
        return (0 === this.graph.countEdges(start, end));
    };

    MapController.prototype.addLeg = function addLeg(startBouy, endBouy) {
        settings.debug.trace && console.log('addLeg', startBouy, endBouy);
        if (startBouy && endBouy) {
            if (this.canAddLeg(this.active.leg.start, this.active.leg.end)) { 
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

    app.controller('Map', ['$scope', 'ApiService', '$q', MapController]);
});