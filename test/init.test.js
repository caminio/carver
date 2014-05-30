require('./helper').init( function( helper ){

  'use strict';
  var expect = helper.chai.expect;
  var Compiler = require(__dirname+'/../index');

  describe( 'Compiler init', function(){

    describe('#init', function(){

      it('with no options', function(){
        expect( Compiler.init ).to.be.a('function');
        expect( Compiler.init() ).to.be.a('object');
        expect( Compiler.init() ).to.be.instanceof(Compiler);
      });

    });

    describe('#init @options', function(){

      var compiler;

      before( function(){
        helper.setupTemplateDir( 'index', 'test_workdir' );
        compiler = Compiler.init({ workdir: helper.getSupportDir('test_workdir'), domain: this.domain });  
      });

      it('reads in settings from <workdir>/.settings.js', function(){
        expect( compiler.workdirSettings ).to.be.a('object');
        expect( compiler.workdirSettings ).to.have.property('destination');
      });

    });

  });

});
