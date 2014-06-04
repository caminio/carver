require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var TemplateNotFoundError = require(__dirname+'/../lib/errors').TemplateNotFoundError;
  var MissingEngineError = require(__dirname+'/../lib/errors').MissingEngineError;

  var wd4Path = helper.getSupportDir('wd4');
  helper.setupTemplateDir( 'index', wd4Path );

  describe( '#parseCwd', function(){

    describe('parse files in cwd', function(){

      it('finds <cwd>/index.hooks.js', function(){
        expect( carver()._hooks.beforeRender ).to.be.a('undefined');
        expect( carver()._hooks.beforeWrite ).to.be.a('undefined');
        expect( carver().includeDefaults().set('cwd', wd4Path)._hooks.beforeRender ).to.have.length(1);
        expect( carver().includeDefaults().set('cwd', wd4Path)._hooks.beforeWrite ).to.be.a('undefined');
      });

      it('throws TemplateNotFoundError if cwd is given but no template was found', function(){
        expect( function(){ carver().set('cwd', wd4Path+'/throws_error'); }).to.throw( new MissingEngineError() ); 
      });
    
    });

  });

});
