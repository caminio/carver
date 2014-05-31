require('./helper').init( function( helper ){

  'use strict';

  var expect      = helper.chai.expect;
  var Compiler    = require(__dirname+'/../index');
  var fs          = require('fs');

  describe('compile options', function(){

    after(function(){
      helper.cleanupPublicDir();
    });

    describe('#filenamePrefix', function(){

      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({ workdir: helper.getSupportDir('test_workdir'), defaultLocale: 'en' });  
        //prevent destination is null
        compiler.workdirSettings.destination = 'public/compiler_opts_test';
      });

      it('prefixes filename with given string', function( done ){
        compiler.compile( helper.fixtures.webpageWithFilename, { filenamePrefix: '1002' }, function(){
          expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/compiler_opts_test/1002/demo_title.htm' ) ).to.eql(true);
          done();
        });
      });

    });

  });

});
