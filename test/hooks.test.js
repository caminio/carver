require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');

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

    it('manipulates the content (before)', function(){
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

    it('manipulates the content (after)', function(){
      return carver()
        .registerEngine('jade', require('jade'))
        .registerHook('afterRender', testAfterRender)
        .render('p Carver rocks!').should.eventually.eql('<p>different after!</p>');
    });


  });

  function testBeforeRender( content, compiler, next ){
    var locals = compiler.options.locals;
    locals.myVar = 'Carver rocks!';
    next(content);
  }

  function testBeforeRender2( content, compiler, next ){
    content = 'p Hooks rock more!';
    next(content);
  }

  function testBeforeRender3( content, compiler, next ){
    content = compiler.content.replace('rocks!','and hooks rock!');
    next(content);
  }

  function testAfterRender( content, compiler, next ){
    content = '<p>different after!</p>';
    next(content);
  }


});
