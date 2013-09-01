define(['controllers/map', 'models/bouy', 'sigma'], function (map, Bouy, sigma) {
  'use strict';

  describe('Controller: MapCtrl', function () {

    // load the controller's module
    beforeEach(angular.mock.module('app'));

    var MapCtrl;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, ApiService) {

      MapCtrl = $controller('Map', {
        $scope: scope,
        ApiService: ApiService
      });
    }));

    it('exists', function () {
      console.log('sdm: sigma?', sigma);
      scope.map.should.be.defined;
    });

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
        x: 1,
        y: 1
      });
      scope.map.addBouy(bouy);
      scope.map.graph.vertices.should.contain(bouy);
    });

    it('should call api.create when a bouy is addded', function() {
      var bouy = new Bouy('test', {
        x: 1,
        y: 1
      });
      spyOn(apiServiceMock);
      scope.map.addBouy(bouy);
      expect(apiServiceMock.post).toHaveBeenCalled();
    });
  });

});