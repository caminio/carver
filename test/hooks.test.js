require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');

  var wd3Path = helper.getSupportDir('wd3');
  helper.setupTemplateDir( 'default', wd3Path );

  describe( '#registerHook', function(){

    it('chainable', function(){
      expect( carver().registerHook( 'before.render', function(){} ) ).to.be.an.instanceOf( Carver );
    });

    it('defines a new hook', function(){
      expect( carver().registerHook( 'before.render', testBeforeRender )._hooks['before.render'] ).to.be.of.length(1);
    });

  });

  describe( 'default hooks', function(){
  
    it('no hook is present by default', function(){
      Carver.knownHooks().forEach( function( hookName ){
        expect( carver()._hooks[hookName] ).to.be.a('undefined');
      });
    });

  });

  describe( 'mini hooks', function(){

     it('like the markdown preprocessor', function( done ){
      var comp = carver();
      comp.options.locals.doc = '#there';
      comp
        .registerHook('before.render', require(__dirname+'/../plugins/pre_processors/markdown_compiler'))
        .render('# test').then( function(html){
          expect( comp.options.locals.markdownContent).to.eql('<h1 id="there">there</h1>\n');
          done();
        }).catch( function( err ){

          console.log(err);
        } );
    });

  });

  describe( 'executing hooks', function(){
  
    it('manipulates a local property', function(){
      return carver()
        .clearEngines()
        .registerEngine('jade', require('jade'))
        .registerHook('before.render', testBeforeRender)
        .render('p=myVar').should.eventually.eql('\n<p>Carver rocks!</p>');
    });

    it('manipulates the content (before)', function(){
      return carver()
        .registerEngine('jade', require('jade'))
        .registerHook('before.render', testBeforeRender2)
        .render('p Carver rocks!').should.eventually.eql('\n<p>Hooks rock more!</p>');
    });

    it('multiple content manipulations', function(){
      return carver()
        .registerEngine('jade', require('jade'))
        .registerHook('before.render', testBeforeRender)
        .registerHook('before.render', testBeforeRender3)
        .render('p Carver rocks!').should.eventually.eql('\n<p>Carver and hooks rock!</p>');
    });

    it('manipulates the content (after)', function(){
      return carver()
        .registerEngine('jade', require('jade'))
        .registerHook('after.render', testAfterRender)
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
    content = content.replace('rocks!','and hooks rock!');
    next(content);
  }

  function testAfterRender( content, compiler, next ){
    content = '<p>different after!</p>';
    next(content);
  }


});
