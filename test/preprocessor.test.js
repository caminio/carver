require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');

  var wd10Path = helper.getSupportDir('wd10');
  helper.setupTemplateDir( 'index', wd10Path );

  describe( 'preprocessor (.hooks.js) file', function(){

    describe('#setup', function(){

      it('runs setup on load', function(){
        expect( carver().set('cwd', wd10Path).initialize().options ).to.have.property('addedBySetup');
      });

    });

  });

});
