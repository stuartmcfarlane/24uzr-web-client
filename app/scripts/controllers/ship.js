/* Map Editor controller
 *
 *
 */

define(['app',
    'settings',
    'lib/performance',
    'models/ship'],

    function (app, settings, performance, Ship) {
    'use strict';

    function ShipController($scope, ApiService, $q) {

        this.ship = new Ship();
        this.ships = [];

        this.scope = $scope;
        this.$q = $q;
        this.apiService = ApiService;

        $scope.$on('ships:queried', this.onShipsLoaded);
        $scope.$on('ship:created', this.onShipCreated);
        $scope.$on('ship:updated', this.onShipUpdated);
        $scope.$on('ship:deleted', this.onShipDeleted);

        this.apiService.query('ships')
        .then(function shipsQuerySuccess(ships) {
            console.log('shipsQuerySuccess', ships);
            $scope.$broadcast('ships:queried', ships);
        });

        $scope.ctrl = this;
        this.fixFocus();
    }

    // api completion events

    ShipController.prototype.onShipsLoaded = function onShipsLoaded(event, ships) {
        settings.debug && console.log('>onShipsLoaded', event, ships);
        if (!angular.isArray(ships)) {
            ships = [ships];
        }
        ships = ships.map(function constructShips(ship) {
            return new Ship(ship);
        });
        settings.debug && console.log(' onShipsLoaded', ships);
        event.currentScope.ctrl.ships = ships;
    };

    ShipController.prototype.onShipsCreated = function onShipCreated(event, ship) {
        settings.debug && console.log('onShipsCreated', event, ship);
    };

    ShipController.prototype.onShipsUpdated = function onShipUpdated(event, ship) {
        settings.debug && console.log('onShipsUpdated', event, ship);
    };

    ShipController.prototype.onShipDeleted = function onShipDeleted(event, ships) {
        settings.debug && console.log('onShipsDeleted', event, ships);
    };

    // button pressed event handlers

    ShipController.prototype.onCreateShipPressed = function onCreateShipPressed() {
        settings.debug && console.log('onCreateShipPressed');
        this.ship = new Ship(this.ship);
        this.ships.push(this.ship);
        var scope = this.scope;
        this.apiService.create('ships', this.ship)
        .then(function shipCreated(ship) {
            settings.debug && console.log('shipCreated', ship);
            scope.$broadcast('ship:created', ship);
        });
    };

    ShipController.prototype.onUpdateShipPressed = function onUpdateShipPressed() {
        settings.debug && console.log('onUpdateShipPressed');
        var scope = this.scope;
        this.apiService.update('ships', ship)
        .then(function(ship) {
            scope.$broadcast('ship:deleted', ship);
        });
    };

    ShipController.prototype.onDeselectShipPressed = function onDeselectShipPressed() {
        settings.debug && console.log('onDeselectShipPressed');
        this.ship = new Ship();
    };

    ShipController.prototype.onDeleteShipPressed = function onDeleteShipPressed() {
        settings.debug && console.log('onDeleteShipPressed');
        var scope = this.scope;
        var ship = this.ship;
        this.ship = new Ship();
        var index = this.ships.indexOf(ship);
        if (-1 !== index) {
            this.ships.splice(index, 1);
        }
        this.apiService.remove('ships', ship)
        .then(function(ship) {
            scope.$broadcast('ship:deleted', ship);
        });
    };

    // button state helpers

    ShipController.prototype.isCreatingNewShip = function isCreatingNewShip() {
        // settings.debug && console.log('>isCreatingNewShip', this);
        var creating = this.ship && (
            this.ship.name &&
            this.ship.name.trim().length
        ) && !this.isExistingShip();
        // settings.debug && console.log('<isCreatingNewShip', creating);
        return creating;
    };

    ShipController.prototype.isExistingShip = function isExistingShip() {
        // settings.debug && console.log('>isExistingShip', this);
        var existing = this.ship && this.ships && (-1 !== this.ships.indexOf(this.ship));
        // settings.debug && console.log('<isExistingShip', existing);
        return existing;
    };

    ShipController.prototype.fixFocus = function fixFocus() {
        // settings.debug && console.log('fixFocus');
        var shipName = document.getElementById('ship-name');
        if (shipName) {
            shipName.focus();
        }
    };



    app.controller('Ship', ['$scope', 'ApiService', '$q', ShipController]);
});