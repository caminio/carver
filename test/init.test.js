require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  var errors  = require(__dirname+'/../lib/errors');

  var wd0Path = helper.getSupportDir('wd0');

  describe( 'carver init', function(){

    describe('#init', function(){

      it('with no options', function(){
        expect( carver ).to.be.a('function');
        expect( carver() ).to.be.an.instanceOf(Carver);
      });

    });

    describe('#set', function(){

      it('sets cwd=wd0', function(){
        expect( carver().registerEngine('jade', require('jade')).set('cwd', wd0Path) );
        expect( carver().registerEngine('jade', require('jade')).set('cwd', wd0Path).get('cwd')).to.eql( wd0Path );
      });

      it('is chainable', function(){
        expect( carver().registerEngine('jade', require('jade')).set('cwd', wd0Path) ).to.be.an.instanceOf(Carver);
      });

      it('sets { cwd: "wd0", destination: "../public" }', function(){
        var opts = { cwd: wd0Path, destination: '../public' };
        expect( carver().registerEngine('jade', require('jade')).set(opts).options.cwd ).to.eql( opts.cwd );
        expect( carver().registerEngine('jade', require('jade')).set(opts).options.destination ).to.eql( opts.destination );
      });

    });

    describe('#get', function(){

      it('returns the set value', function(){
        expect( carver().registerEngine('jade', require('jade')).set('cwd', wd0Path ) ).to.eql( wd0Path );
      });

    });

    describe('@options properties', function(){

      before( function(){
        helper.setupTemplateDir( 'index', wd0Path );
      });

      describe('@cwd', function(){

        it('throws FileNotFoundError if cwd does not exist', function(){
          expect( function(){ carver().registerEngine('jade', require('jade')).set('cwd','wd0'); } ).to.throw(errors.FileNotFoundError);
        });

        it('stores settings from .settings.js in @cwdSettings', function(){
          var compiler = carver().set('cwd', wd0Path);
          expect( compiler.cwdSettings ).to.eql({destination: '../public/workdir_folder'});
        });

      });

      describe('@locals', function(){
        it('has an empty @locals property', function(){
          var compiler = carver();
          expect( compiler.get('locals') ).to.eql({});
        });
      });

    });

  });

  describe('#includeAll', function(){
  
    it('includes jade', function(){
      expect( carver().registerEngine('jade', require('jade')).engines ).to.have.property('jade');
    });

  });

});
