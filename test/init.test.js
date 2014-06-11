require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  var errors  = require(__dirname+'/../lib/errors');

  var wd0Path = helper.getSupportDir('wd0');
  helper.setupTemplateDir( 'index', wd0Path );
  
  /* jshint -W024 */
  /* jshint expr:true */
  describe( 'carver init', function(){

    describe('#init', function(){

      it('with no options', function(){
        expect( carver ).to.be.a('function');
        expect( carver() ).to.be.an.instanceOf(Carver);
      });

    });

    describe('#set', function(){

      it('sets cwd=wd0', function(){
        expect( carver().set('cwd', wd0Path) );
        expect( carver().set('cwd', wd0Path).get('cwd')).to.eql( wd0Path );
      });

      it('is chainable', function(){
        expect( carver().set('cwd', wd0Path) ).to.be.an.instanceOf(Carver);
      });

      it('sets { cwd: "wd0", template: "test" }', function(){
        var opts = { cwd: wd0Path, template: 'test' };
        expect( carver().set(opts).options.cwd ).to.eql( opts.cwd );
        expect( carver().set(opts).options.template ).to.eql( opts.template );
      });

    });

    describe('#get', function(){

      it('returns the set value', function(){
        expect( carver().set('cwd', wd0Path ).get('cwd') ).to.eql( wd0Path );
      });

    });

    describe('#clone', function(){

      it('returns a cloned carver instance', function(){
        var original = carver().set('doc', { name: 'adoc', content: 'content' });
        original.options.locals.testparam = 'that';
        var clone = original.clone();
        expect( clone.options.locals.testparam ).to.eq( original.options.locals.testparam );
        expect( clone.options.locals.doc ).to.not.exist; 
      });
    });

    describe('@options properties', function(){

      before( function(){
        helper.setupTemplateDir( 'index', wd0Path );
      });

      describe('@cwd', function(){

        it('throws FileNotFoundError if cwd does not exist', function(){
          expect( function(){ carver().set('cwd','wd0'); } ).to.throw(errors.FileNotFoundError);
        });

        it('stores settings from .settings.js in @cwdSettings', function(){
          var compiler = carver().set('cwd', wd0Path);
          expect( compiler.options.destinations ).to.include('file://../public');
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
 
    before(function(){
      this.compiler = carver().includeAll();
    });

    it('includes markdown', function(){
      expect( this.compiler.engines ).to.have.property('md');
      expect( this.compiler.engines ).to.have.property('markdown');
      expect( this.compiler.engines ).to.have.property('markdown');
    });

    it('includes fileWriter', function(){
      expect( this.compiler.writers ).to.have.property('file');
    });

  });

  describe( '#initialize', function(){
  
    it('chainable', function(){
      expect( carver().initialize() ).to.be.an.instanceOf(Carver);
    });

    it('reads in template files');

    it('throws error if no template file was found but cwd was used');

    describe('reads in .settings.js from cwd', function(){
    
      it('sets .to() with write.to property');

    });

  });


});
