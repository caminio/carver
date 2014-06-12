require('../helper').init( function( helper ){

  'use strict';
  var expect            = helper.chai.expect;
  var carver            = require(__dirname+'/../../index');
  var markdownCompiler  = require(__dirname+'/../../plugins/pre_processors/markdown_compiler');
  var fs                = require('fs');

  describe( 'markdown compiler (preprocessor)', function(){

    it('lang: en', function( done ){
      var comp = carver();
      comp
        .set('lang','en')
        .set('doc',helper.fixtures.trWebpage)
        .registerHook('before.render', markdownCompiler )
        .render().then( function(){
          expect( comp.options.locals.markdownContent).to.eql('<h1 id="english">english</h1>\n');
          done();
        }).catch( function( err ){
          console.log(err);
        } );
    });

    it('lang: de', function( done ){
      var comp = carver();
      comp
        .set('lang','de')
        .set('doc',helper.fixtures.trWebpage)
        .registerHook('before.render', markdownCompiler )
        .render().then( function(){
          expect( comp.options.locals.markdownContent).to.eql('<h1 id="deutsch">deutsch</h1>\n');
          done();
        }).catch( function( err ){
          console.log(err);
        } );
    });

  });

  describe( 'markdown compiler (preprocessor) with write', function(){

    var wd8Path = helper.getSupportDir('wd8');
    helper.setupTemplateDir( 'index', wd8Path );

    before(function(done){
      fs.writeFileSync( __dirname+'/../support/wd8/index.jade', '!=markdownContent');
      var comp = carver();
      comp
        .set('cwd',wd8Path)
        .set('doc',helper.fixtures.trWebpage)
        .includeFileWriter()
        .set('destinations', ['file://'+__dirname+'/../support/public/md-test/'])
        .registerHook('before.render', markdownCompiler )
        .write().then( function(){
          done();
        }).catch( function( err ){
          console.log(err);
        } );
    });

    it('lang: en', function(){
      expect( __dirname+'/../support/public/md-test/tr_webpage.htm.en' ).to.be.a.file();
      expect( fs.readFileSync(__dirname+'/../support/public/md-test/tr_webpage.htm.en','utf8') ).to.eql('<h1 id=\"english\">english</h1>\n');
      expect( fs.readFileSync(__dirname+'/../support/public/md-test/tr_webpage.htm.de','utf8') ).to.eql('<h1 id=\"deutsch\">deutsch</h1>\n');
    });

  });

});
