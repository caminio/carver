require('./helper').init( function( helper ){

  'use strict';
  var expect                = helper.chai.expect;
  var carver                = require(__dirname+'/../index');
  var Carver                = require(__dirname+'/../lib/carver');
  var TemplateNotFoundError = require(__dirname+'/../lib/errors').TemplateNotFoundError;
  var jade                  = require('jade');
  var MissingEngineError    = require(__dirname+'/../lib/errors').MissingEngineError;

  var wd4Path               = helper.getSupportDir('wd4');

  helper.setupTemplateDir( 'index', wd4Path );

  describe( '#parseCwd', function(){

    describe('parse files in cwd', function(){

      it('finds <cwd>/index.hooks.js', function(){
        expect( carver()._hooks.beforeRender ).to.be.a('undefined');
        expect( carver()._hooks.beforeWrite ).to.be.a('undefined');
        expect( carver().registerEngine('jade', jade).set('cwd', wd4Path).initialize()._hooks.beforeRender ).to.have.length(1);
        expect( carver().registerEngine('jade', jade).set('cwd', wd4Path).initialize()._hooks.beforeWrite ).to.be.a('undefined');
      });

      it('won\'t initialize if <template>.jade is not present in cwd', function(){
        var compiler = carver().registerEngine('jade', jade).set({ template: 'does_not_exist', cwd: wd4Path});
        expect( function(){ compiler.initialize(); } ).to.throw( new TemplateNotFoundError() );
      });

      it('throws TemplateNotFoundError if cwd is given but no template was found', function(){
        expect( function(){ carver().set('cwd', wd4Path+'/throws_error'); }).to.throw( new MissingEngineError() ); 
      });
    
    });

  });

});
