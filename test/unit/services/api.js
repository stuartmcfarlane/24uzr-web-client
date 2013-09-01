define(['services/api'], function () {
  'use strict';

  describe('Service: ApiService', function () {

    beforeEach(angular.mock.module('app'));

    it('should exist', inject( function( ApiService ) {
      expect( ApiService ).to.exist;
    }));

    describe('get function', function() {

      it('should exist', inject( function( ApiService ) {
        expect( ApiService.get ).to.be.a( 'function' );
      }));

      it('should get the api', inject( function( ApiService ) {
        ApiService.get('bouies', 1).then(function(bouy){
          expect(bouy).to.exist;
        });
      }));
    });

    describe('query function', function() {

      it('should exist', inject( function( ApiService ) {
        expect( ApiService.query ).to.be.a( 'function' );
      }));
    });

    describe('create function', function() {

      it('should exist', inject( function( ApiService ) {
        expect( ApiService.create ).to.be.a( 'function' );
      }));
    });

    describe('update function', function() {

      it('should exist', inject( function( ApiService ) {
        expect( ApiService.update ).to.be.a( 'function' );
      }));
    });

    describe('remove function', function() {

      it('should exist', inject( function( ApiService ) {
        expect( ApiService.remove ).to.be.a( 'function' );
      }));
    });

  });

});