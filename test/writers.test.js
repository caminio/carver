require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  var errors  = require(__dirname+'/../lib/errors');

  var wd1Path = helper.getSupportDir('wd1');

  describe( '#registerWriter', function(){

    describe('param: string', function(){
      
      it('available as plaintext', function(){
        var compiler = carver().registerWriter( 'plaintext', function(){} );
        expect( Carver.writers ).to.have.property('plaintext');
      });
    });

    describe('param: array', function(){

      it('available as text1, text2', function(){
        var compiler = carver().registerWriter( ['text1','text2'], function(){} );
        expect( Carver.writers ).to.have.property('text1');
        expect( Carver.writers ).to.have.property('text2');
      });

    });

    it('chainable', function(){
      expect( carver().registerWriter( 'plaintext', function(){} ) ).to.be.an.instanceOf( Carver );
    });

  });

});
