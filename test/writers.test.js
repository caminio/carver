require('./helper').init( function( helper ){

  'use strict';

  var fs          = require('fs');
  var expect      = helper.chai.expect;
  var Compiler    = require(__dirname+'/../index');

  describe('writers', function(){

    after(function(){
      helper.cleanupPublicDir();
    });

    describe('template -> destination', function(){

      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({ workdir: helper.getSupportDir('test_workdir') });  
        //prevent destination is null
        compiler.workdirSettings.destination = 'public/test_dest';
      });

      it('returns a jade compiled string', function(){
        expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test_dest/index.htm' ) ).to.eql(false);
        expect( compiler.compile() ).to.be.a('undefined');
        expect( fs.existsSync( helper.getSupportDir('test_workdir') + '/public/test_dest/index.htm' ) ).to.eql(true);
      });

    });

  });

});
