require('./helper').init( function( helper ){

  'use strict';

  var expect          = helper.chai.expect;
  var carver          = require(__dirname+'/../index');
  var Carver          = require(__dirname+'/../lib/carver');
  var jade            = require('jade');
  var join            = require('path').join;

  var wd7Path = helper.getSupportDir('wd7');
  helper.setupTemplateDir( 'index', wd7Path );

  var wd71Path = helper.getSupportDir('wd71');
  helper.setupTemplateDir( 'index', wd71Path );

  describe( '#dependencies', function(){

    it('chainable', function(){
      expect( carver().dependencies({ cwd: 'different/wd' })).to.be.an.instanceOf( Carver );
    });

    it('keeps dependencies in instance cache', function(){
      expect( carver().options.dependencies ).to.be.a('undefined');
      expect( carver().dependencies({ cwd: 'diff/wd' }).options.dependencies ).to.have.length.of(1);
    });

  });

  describe( '#writer trigger dependencies', function(){
   
    before(function(done){
      carver()
        .set('cwd', wd7Path)
        .registerEngine('jade', jade)
        .includeFileWriter()
        .set('destinations',['file://../public/wd7'])
        .dependencies({ cwd: wd71Path, destinations: ['file://../public/wd71'] })
        .write()
        .then(function(){
          done();
        });
    });

    it('runs dependency and renders given template', function(){
     expect( join(wd7Path,'..','public/wd7/index.htm') ).to.be.a.file();
     expect( join(wd7Path,'..','public/wd71/index.htm') ).to.be.a.file();
    });

  });

  describe( '#triggers dependencies for siblings', function(){
  
    before(function(done){
      carver()
        .set('cwd', wd7Path)
        .set('doc', helper.fixtures.simpleWebpage)
        .registerEngine('jade', jade)
        .includeFileWriter()
        .set('destinations',['file://../public/wd7-1'])
        .dependencies({ doc: helper.fixtures.simpleWebpage2 })
        .write()
        .then(function(){
          done();
        });
    });

    it('runs dependency documents', function(){
      expect( join(wd7Path,'..','public/wd7-1/simple_webpage.htm') ).to.be.a.file();
      expect( join(wd7Path,'..','public/wd7-1/test.htm') ).to.be.a.file();
    });

  });

});
