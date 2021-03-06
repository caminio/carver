require('./helper').init( function( helper ){

  'use strict';

  var expect      = helper.chai.expect;
  var Compiler    = require(__dirname+'/../index');
  var fs          = require('fs');

  describe('objects_compiler', function(){

    after(function(){
      helper.cleanupPublicDir();
    });

    describe('object as content', function(){

      var compiler;

      before( function(){
        compiler = Compiler.init();
      });

      it('tries to find the object\'s content property and compiles that as string', function(){
        expect( compiler.compile( helper.fixtures.webpage ) ).to.be.a('string');
        expect( compiler.compile( helper.fixtures.webpage ) ).to.eql('demo content');
      });

    });

    describe('object with translations', function(){
    
      var compiler;

      before( function(){
        compiler = Compiler.init();
      });

      it('tries to find "en" translations inside the object', function(){
        expect( compiler.compile( helper.fixtures.webpageWithTranslations, { locale: 'en' } )).to.eql('demo content en');
      });

      it('tries to find "de" translations inside the object', function(){
        expect( compiler.compile( helper.fixtures.webpageWithTranslations, { locale: 'de' } )).to.eql('Demonstriert Inhalte de');
      });

    });

    describe('object with only one translations', function(){
      
      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({ workdir: helper.getSupportDir('test_workdir'), defaultLocale: 'en', multiLangs: true });  
        //prevent destination is null
        compiler.workdirSettings.destination = 'public/test_dest';
      });

      it('writes both translation file with ending .htm, .htm.en', function( done ){
        compiler.compile( helper.fixtures.webpageWithOneTranslation, function(){
          expect( compiler.compile(helper.fixtures.webpageWithOneTranslation) ).to.be.a('undefined');
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test_dest/index.htm' ) ).to.eql(true);
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test_dest/index.htm.en' ) ).to.eql(true);
          done();
        });
      });
    });

    describe('object with translations', function(){
      
      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({ workdir: helper.getSupportDir('test_workdir'), multiLangs: true });  
        //prevent destination is null
        compiler.workdirSettings.destination = 'public/test2_dest';
      });

      it('writes both translation file with ending .htm.de, .htm.en and .htm', function( done ){
        compiler.compile( helper.fixtures.webpageWithTranslations, function(){
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test2_dest/index.htm.en' ) ).to.eql(true);
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test2_dest/index.htm.de' ) ).to.eql(true);
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test2_dest/index.htm' ) ).to.eql(true);
          done();
        });
      });
    });

    describe('object with filename', function(){
      
      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({ workdir: helper.getSupportDir('test_workdir') });  
        compiler.workdirSettings.destination = 'public/test2_dest';
      });

      it('writes one .htm file with the filename defined within the obj', function( done ){
        compiler.compile( helper.fixtures.webpageWithFilename, function(){
          expect( helper.fixtures.webpageWithFilename.filename ).to.eql('demo_title');
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test2_dest/demo_title.htm' ) ).to.eql(true);
          done();
        });
      });
    });

    describe('object with template', function(){
      
      var compiler;

      before( function(){
        helper.setupTemplateDir( 'default', 'test_workdir' );
        compiler = Compiler.init({ workdir: helper.getSupportDir('test_workdir') });  
        compiler.workdirSettings.destination = 'public/test2_dest';
      });

      it('writes one .htm file using the template within the obj', function( done ){
        compiler.compile( helper.fixtures.webpageWithTemplate, function(){
          expect( helper.fixtures.webpageWithTemplate.template ).to.eql('default');
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test2_dest/demo_title.htm' ) ).to.eql(true);
          done();
        });
      });
    });

  });

});
