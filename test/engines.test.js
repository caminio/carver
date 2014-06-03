require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  var errors  = require(__dirname+'/../lib/errors');

  var wd1Path = helper.getSupportDir('wd1');

  describe( '#registerEngine', function(){

    describe('param: string', function(){
      
      it('available as plaintext', function(){
        var compiler = carver().registerEngine( 'plaintext', function(){} );
        expect( Carver.engines ).to.have.property('plaintext');
      });
    });

    describe('param: array', function(){

      it('available as text1, text2', function(){
        var compiler = carver().registerEngine( ['text1','text2'], function(){} );
        expect( Carver.engines ).to.have.property('text1');
        expect( Carver.engines ).to.have.property('text2');
      });

    });

    it('chainable', function(){
      expect( carver().registerEngine( 'plaintext', function(){} ) ).to.be.an.instanceOf( Carver );
    });

  });

  describe( '#clearEngines', function(){
    it('clears all engines', function(){
      expect( Object.keys(Carver.engines).length ).to.be.above(0);
      carver().clearEngines();
      expect( Object.keys(Carver.engines) ).to.be.of.length(0);
    });
  });

});
