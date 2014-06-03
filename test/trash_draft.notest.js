require('./helper').init( function( helper ){

  'use strict';

  var expect      = helper.chai.expect;
  var Compiler    = require(__dirname+'/../index');
  var fs          = require('fs');

  describe('draft option', function(){

    after(function(){
      helper.cleanupPublicDir();
    });

    describe('one translations', function(){
      
      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({  draftsPath: 'public/drafts', workdir: helper.getSupportDir('test_workdir'), defaultLocale: 'en', multiLangs: true });  
        //prevent destination is null
        compiler.workdirSettings.destination = 'public/test_dest';
      });

      it('writes both translation file with ending .htm, .htm.en', function( done ){
        compiler.compile( helper.fixtures.webpageWithOneTranslation, function(){
          expect( compiler.compile(helper.fixtures.webpageWithOneTranslation) ).to.be.a('undefined');
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/drafts/'+helper.fixtures.webpageWithOneTranslation._id+'.htm.en' ) ).to.eql(true);
          done();
        });
      });
    });

    describe('object with translations', function(){
      
      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({ draftsPath: 'public/drafts', workdir: helper.getSupportDir('test_workdir'), multiLangs: true });  
        //prevent destination is null
        compiler.workdirSettings.destination = 'public/test2_dest';
      });

      it('writes both translation file with ending .htm.de, .htm.en and .htm', function( done ){
        var wp = helper.fixtures.webpageWithTranslations;
        compiler.compile( wp, function(){
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/drafts/'+wp._id+'.htm.en' ) ).to.eql(true);
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/drafts/'+wp._id+'.htm.de' ) ).to.eql(true);
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/drafts/'+wp._id+'.htm' ) ).to.eql(true);
          done();
        });
      });
    });

    describe('object with template', function(){
      
      var compiler;

      before( function(){
        helper.setupTemplateDir( 'default', 'test_workdir' );
        compiler = Compiler.init({ draftsPath: 'public/drafts', workdir: helper.getSupportDir('test_workdir') });  
        compiler.workdirSettings.destination = 'public/test2_dest';
      });

      it('writes one .htm file using the template within the obj', function( done ){
        var wp = helper.fixtures.webpageWithTemplate;
        compiler.compile( wp, function(){
          expect( helper.fixtures.webpageWithTemplate.template ).to.eql('default');
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/drafts/'+wp._id+'.htm' ) ).to.eql(true);
          done();
        });
      });
    });

  });

});
