require('./helper').init( function( helper ){

  'use strict';
  var expect          = helper.chai.expect;
  var carver          = require(__dirname+'/../index');
  var Carver          = require(__dirname+'/../lib/carver');
  var jade            = require('jade');
  var join            = require('path').join;
  var MissingCwdError = require('../lib/errors').MissingCwdError;
  var MissingDestinationError = require('../lib/errors').MissingDestinationError;
  var UnknownWriterError = require('../lib/errors').UnknownWriterError;

  var wd1Path = helper.getSupportDir('wd1');
  helper.setupTemplateDir( 'index', wd1Path );

  var wd11Path = helper.getSupportDir('wd11');
  helper.setupTemplateDir( 'default', wd11Path );

  describe( '#registerWriter', function(){

    describe('param: string', function(){
      
      it('available as plaintext', function(){
        carver().registerWriter( 'plaintext', function(){} );
        expect( Carver.writers ).to.have.property('plaintext');
      });
    });

    describe('param: array', function(){

      it('available as text1, text2', function(){
        carver().registerWriter( ['text1','text2'], function(){} );
        expect( Carver.writers ).to.have.property('text1');
        expect( Carver.writers ).to.have.property('text2');
      });

    });

    it('chainable', function(){
      expect( carver().registerWriter( 'dummy', function(){} ) ).to.be.an.instanceOf( Carver );
    });

  });

  describe( '#write', function(){

    it('throws MissingCwdError if cwd is not set', function(){
      expect( carver().write ).to.throw( new MissingCwdError() );
    });

    it('throws MissingWriterError if usage of write without any writer', function(){
      expect( carver().set('cwd',wd1Path).write ).to.throw( 'Cannot read property \'options\' of undefined' );
    });

    describe('#checkDestination', function(){
      it('throws MissingDestinationError if options.destination has not been set (with .set("destination", "/path/to/dest") or inside config/env.js)', function(){
        expect( carver().set('cwd',wd1Path).set('destination',null).write ).to.throw( new MissingDestinationError() );
      });
    });

    it('returns a promise', function(){
      var result = carver()
        .registerEngine('jade', jade)
        .includeFileWriter()
        .set('cwd', wd1Path)
        .write();
      return expect(result).to.be.fullfilled;
    });

    describe('#checkWriter', function(){

      it('fails if no writer can be associated', function(){
        expect( carver().set('cwd',wd1Path).set('destination','unsupported://path').write ).to.throw( new UnknownWriterError() );
      });

      it('passes with valid writer', function(){
        return expect( carver().set('cwd',wd1Path).write ).to.be.fullfilled;
      });

    });

    describe('resulting files', function(){

      before(function(){
        this.compiler = carver().registerEngine('jade',jade).includeFileWriter().set('cwd',wd1Path);
      });

      it('writes result into a file', function( done ){
        this.compiler.write()
          .then( function(){
            expect( join(wd1Path,'..','public/index.htm') ).to.be.a.file();
            done();
          });
      });

      describe('writes file to an array destinations', function(){

        before(function(done){
          this.compiler.write( 'file://../public/first', 'file://../public/second' )
            .then( function(){
              done();
            })
          .catch( function(err){
            console.log('having error',err);
            done();
          });
        });

        it('passes', function(){
          expect( join(wd1Path,'..','public/first/index.htm') ).to.be.a.file();
          expect( join(wd1Path,'..','public/second/index.htm') ).to.be.a.file();
        });

      });

      describe('uses the template\'s name as default filename, if non was given', function(){
        
        before(function(done){
          var test = this;
          carver()
            .registerEngine('jade',jade)
            .includeFileWriter()
            .set('cwd',wd11Path)
            .set('template','default')
            .write()
            .then( function(){
              done();
            })
          .catch( function(err){
            test.error = err;
            done();
          });
        });

        it('passes', function(){
          expect( this.error ).to.be.a('undefined');
        });

        it('writes a template to the destination', function(){
          expect( join(wd11Path,'..','public/default.htm') ).to.be.a.file();
        });

      });

    });

    describe('prefixing files in destination path with directory', function(){
    
      describe('writes file to destinations with dir prefixed', function(){

        before(function(done){
          carver()
            .registerEngine('jade', require('jade'))
            .includeFileWriter()
            .set( 'cwd', wd11Path )
            .set( 'template', 'default' )
            .set( 'dir', 'wd11' )
            .write()
            .then(function(){
              done();
            });
        });

        it('exists', function(){
          expect( join(wd11Path,'..','public/wd11/default.htm') ).to.be.a.file();
        });

      });

      describe('can change directory on runtime', function(){
      
        before(function(done){
          carver()
            .registerEngine('jade', require('jade'))
            .includeFileWriter()
            .set( 'cwd', wd11Path )
            .set( 'template', 'default' )
            .registerHook('before.write', function(content,compiler,resolve){ compiler.set('dir','wd11-hook'); resolve(content); })
            .write()
            .then(function(){
              done();
            });
        });

        it('exists', function(){
          expect( join(wd11Path,'..','public/wd11-hook/default.htm') ).to.be.a.file();
        });

      });

    });


  });

});
