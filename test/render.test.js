require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');

  var wd2Path = helper.getSupportDir('wd2');

  describe( '#useEngine', function(){
    
    it('uses the given engine, in case of ambiguous engine setup', function(){ 
      expect( carver().registerEngine(['md','markdown'], require('../lib/engines/markdown'))._useEngine ).to.be.a('undefined');
      expect( carver().includeMarkdownEngine().useEngine('markdown')._useEngine ).to.be.a('object');
    });

  });


  describe( '#render', function(){

    it('plaintext content', function(){
      return carver()
        .render('plaintext').should.eventually.eql('plaintext');
    });

    it('markdown content', function(){
      return carver()
        .includeMarkdownEngine()
        .useEngine('markdown')
        .render('plaintext').should.eventually.eql('<p>plaintext</p>\n');
    });

    it('jade content', function(){
      return carver()
        .clearEngines()
        .registerEngine('jade', require('jade'))
        .render('p plaintext').should.eventually.eql('\n<p>plaintext</p>');
    });

  });

  describe('template', function(){

    before(function(){
      helper.setupTemplateDir( 'default', wd2Path );
      helper.setupSnippetDir( '', 'markdown', wd2Path, '!=markdownContent' );
    });

    it('uses index template by default', function(){
      expect( carver().options.template ).to.eql('index');
    });

    it('does not allow to set template without cwd', function(){
      expect( function(){ carver().set('template','default'); }).to.throw( Error );
    });

    it('uses the given template', function(){
      expect( carver().registerEngine('jade', require('jade')).set('cwd',wd2Path).set('template','default').options.template ).to.eql('default');
    });

    it('works with markdown compiler and 2 languages', function( done ){
      var comp = carver();
      comp.options.locals.doc = { translations: [
        { locale: 'en', content: '#there'}, 
        { locale: 'de', content: '#other' }
      ]};
      
      comp.options.lang = 'en';
      comp
        .registerEngine('jade', require('jade'))
        .set('cwd',wd2Path)
        .set('template','markdown')
        .registerHook('before.render', require(__dirname+'/../plugins/pre_processors/markdown_compiler'))
        .render('# test').then( function(html){
          expect( comp.options.locals.markdownContent).to.eql('<h1 id="there">there</h1>\n');
          done();
        }).catch( function( err ){
          console.log(err);
        } );
    });

  });

});
