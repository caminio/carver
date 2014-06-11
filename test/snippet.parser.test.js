/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-06 18:15:08
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 23:09:35
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

require('./helper').init( function( helper ){

  'use strict';
  
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  // var errors  = require(__dirname+'/../lib/errors');

  var wd8Path = helper.getSupportDir('wd8');
  helper.setupSnippetDir( 'pebbles', 'testpebble', wd8Path );
  var pebbleParser = require(__dirname+'/../plugins/post_processors/snippet/snippet_parser')( Carver );
  var compiler = carver()
                  .set({ cwd: wd8Path})
                  .includeMarkdownEngine()
                  .useEngine('markdown');


  describe('pebble_parser test', function(){

    it('gets a content string', function( done ){

      var testcontent = '{{ pebble: first }}, {{ pebble: second }}';

      compiler.options.locals.doc ={ pebbles: [
      {
        name: 'first',
        translations: [{
          locale: 'en',
          content: '# Hello world'
        }]
      }]};

      compiler.options.snippetKeyword = 'pebble';

      pebbleParser( testcontent, compiler, function(){
        done();
      });
    });

    it('works without translations, will show an error if no layout is defined', function(){
      compiler.options.snippetKeyword = 'pebble';
      var result = '<p>{{ something: NO CONTENT FOUND IN OBJECT, did you forget to send an object with translations? }}</p>\n';
      return compiler
        .registerEngine('jade', require('jade'))
        .registerHook('after.render', pebbleParser )
        .render('{{ pebble: something }}').should.eventually.eql( result );
    });

    it('works with snippet arrays', function(){
      compiler.options.snippetKeyword = 'pebble';
      compiler.options.locals.items = ['1', '2', '3'];
      return compiler
        .registerHook('after.render', pebbleParser )
        .render('{{ pebble: anArray, array=items }}').should.eventually.eql('<p>1</p>\n<p>2</p>\n<p>3</p>\n');
    });


    it('can be registered as before.render hook', function(){
      return compiler
        .registerHook('after.render', pebbleParser )
        .render('{{ pebble: first }}').should.eventually.eql('<h1 id=\"hello-world\">Hello world</h1>\n');
    });

     it('uses the defined templates', function(){
      return compiler
        .registerHook('after.render', pebbleParser )
        .render('{{ Pebble: testpebble }}').should.eventually.eql('\n<h1>Heading</h1>');
    });

    it('works with snippet array objects', function(){
      helper.setupSnippetDir( 'pebbles', 'contentArray', wd8Path, 'p=item.content' );
      compiler.options.snippetKeyword = 'pebble';
      compiler.options.locals.items = [{ content: '1' }, { content: '2' },{ content: '3' }];
      return compiler
        .registerHook('after.render', pebbleParser )
        .render('{{ pebble: contentArray, array=items }}').should.eventually.eql('\n<p>1</p>\n<p>2</p>\n<p>3</p>');
    });


    it('works with indexes of snippet array objects', function(){
      helper.setupSnippetDir( 'pebbles', 'indexArray', wd8Path, 'p=number.index' );
      compiler.options.snippetKeyword = 'pebble';
      compiler.options.locals.numbers = [{ content: '1' }, { content: '2' },{ content: '3' }];
      return compiler
        .registerHook('after.render', pebbleParser )
        .render('{{ pebble: indexArray, array=numbers }}').should.eventually.eql('\n<p>0</p>\n<p>1</p>\n<p>2</p>');
    });

  });

});
