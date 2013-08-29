define(['controllers/map', 'models/bouy'], function (map, Bouy) {
  'use strict';

  describe('Controller: MapCtrl', function () {

    // load the controller's module
    beforeEach(angular.mock.module('app'));

    var MapCtrl
      , scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
      MapCtrl = $controller('Map', {
        $scope: scope
      });
    }));

    it('should have a currentBouy', function () {
      scope.map.currentBouy.should.be.defined;
    });
    it('should have a graph', function () {
      scope.map.graph.should.be.defined;
    });
    it('should have a graph with vertices', function () {
      scope.map.graph.vertices.should.be.defined;
    });
    it('should have a graph with edges', function () {
      scope.map.graph.edges.should.be.defined;
    });
    it('should be able to add bouys', function() {
      var bouy = new Bouy('test', {
        latitude: 1,
        longitude: 1
      });
      scope.map.addBouy(bouy);
      scope.map.graph.vertices.should.contain(bouy);
    })
  });

});