require('./helper').init( function( helper ){

  'use strict';
  var expect          = helper.chai.expect;
  var carver          = require(__dirname+'/../index');
  var Carver          = require(__dirname+'/../lib/carver');
  var errors          = require(__dirname+'/../lib/errors');
  var RSVP            = require('rsvp');
  var jade            = require('jade');
  var join            = require('path').join;
  var MissingCwdError = require('../lib/errors').MissingCwdError;
  var MissingDestinationError = require('../lib/errors').MissingDestinationError;
  var UnknownWriterError = require('../lib/errors').UnknownWriterError;
  var MissingWriterError = require('../lib/errors').MissingWriterError;

  var wd1Path = helper.getSupportDir('wd1');
  helper.setupTemplateDir( 'index', wd1Path );

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

      it('if locale property in manyKey is present, it will be attached to the fileExtension', function(){

      });

      it('if manyKey property has many objects, they will be written with locale property if present');

      it('uses the template\'s name as default filename, if non was given');

      it('writes a template to the destination');

      it('writes to DRAFT folder');

    });

  });

});
