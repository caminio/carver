require('./helper').init( function( helper ){

  'use strict';
  var expect = helper.chai.expect;
  var Compiler = require(__dirname+'/../index');


  describe( 'engines', function(){

    after(function(){
      helper.cleanupPublicDir();
    });


    describe('plaintext', function(){

      var compiler;

      before(function(){
        compiler = Compiler.init();
      });

      it('is a valid function', function(){
        expect( compiler.compile ).to.be.a('function');
      });

      it('returns plain text as plain text', function(){
        expect( compiler.compile('text') ).to.be.a('string');
        expect( compiler.compile('text') ).to.eql('text');
      });

    });

    describe('markdown', function(){

      var compiler;

      before(function(){
        compiler = Compiler.init();
      });

      it('returns html compiled markdown string', function(){
        expect( compiler.compile('#text', { engine: 'markdown' }) ).to.be.a('string');
        expect( compiler.compile('#text', { engine: 'markdown' }) ).to.eql('<h1 id="text">text</h1>\n');
      });

    });

    describe('templates: jade (built-in)', function(){

      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({ workdir: helper.getSupportDir('test_workdir') });  
        //prevent destination is null
        compiler.workdirSettings.destination = null;
      });

      it('returns a jade compiled string', function(){
        expect( compiler.compile() ).to.be.a('string');
        expect( compiler.compile() ).to.eql('<h1>Heading</h1>');
      });

    });

  });

});
