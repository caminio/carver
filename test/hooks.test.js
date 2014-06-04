require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  var errors  = require(__dirname+'/../lib/errors');

  var wd3Path = helper.getSupportDir('wd3');
  helper.setupTemplateDir( 'default', wd3Path );

  describe( '#registerHook', function(){

    it('chainable', function(){
      expect( carver().registerHook( 'beforeRender', function(){} ) ).to.be.an.instanceOf( Carver );
    });

    it('defines a new hook', function(){
      expect( carver().registerHook( 'beforeRender', testBeforeRender )._hooks.beforeRender ).to.be.of.length(1);
    });

  });

  describe( 'default hooks', function(){
  
    it('no hook is present by default', function(){
      Carver.knownHooks().forEach( function( hookName ){
        expect( carver()._hooks[hookName] ).to.be.a('undefined');
      });
    });

  });

  describe( 'executing hooks', function(){
  
    it('manipulates a local property', function(){
      return carver()
        .registerEngine('jade', require('jade'))
        .registerHook('beforeRender', testBeforeRender)
        .render('p=myVar').should.eventually.eql('\n<p>Carver rocks!</p>');
    });

    it('manipulates the content', function(){
      return carver()
        .registerEngine('jade', require('jade'))
        .registerHook('beforeRender', testBeforeRender2)
        .render('p Carver rocks!').should.eventually.eql('\n<p>Hooks rock more!</p>');
    });

    it('multiple content manipulations', function(){
      return carver()
        .registerEngine('jade', require('jade'))
        .registerHook('beforeRender', testBeforeRender)
        .registerHook('beforeRender', testBeforeRender3)
        .render('p Carver rocks!').should.eventually.eql('\n<p>Carver and hooks rock!</p>');
    });

  });

  function testBeforeRender( compiler, next ){
    var locals = compiler.options.locals;
    locals.myVar = 'Carver rocks!';
    next();
  }

  function testBeforeRender2( compiler, next ){
    compiler.content = 'p Hooks rock more!';
    next();
  }

  function testBeforeRender3( compiler, next ){
    compiler.content = compiler.content.replace('rocks!','and hooks rock!');
    next();
  }

});