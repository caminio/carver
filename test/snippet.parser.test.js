/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-06 18:15:08
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 02:03:18
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
  var pebbleParser = require(__dirname+'/../plugins/pre_processors/snippet/snippet_parser')( Carver );
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

      compiler.options.keyword = 'pebble';

      pebbleParser( testcontent, compiler, function( content ){
        console.log('GETTING: ', content );
        done();
      });
    });

    it('works without translations, will show an error if no layout is defined', function(){
      compiler.options.keyword = 'pebble';
      return compiler
        .registerEngine('jade', require('jade'))
        .registerHook('before.render', pebbleParser )
        .includeMarkdownEngine()
        .useEngine('markdown')
        .render('{{ pebble: something }}').should.eventually.eql('<p>{{ something: NO DATA FOUND }}</p>\n');
    });

    it('works with snippet arrays', function(){
      compiler.options.keyword = 'pebble';
      compiler.options.locals.items = ['1', '2', '3'];
      return compiler
        .registerEngine('jade', require('jade'))
        .registerHook('before.render', pebbleParser )
        .includeMarkdownEngine()
        .useEngine('markdown')
        .render('{{ pebble: anArray, array=items }}').should.eventually.eql('<p>1</p><br><p>2</p><br><p>3</p>\n');
    });


    it('can be registered as before.render hook', function(){
      return compiler
        .registerEngine('jade', require('jade'))
        .registerHook('before.render', pebbleParser )
        .includeMarkdownEngine()
        .useEngine('markdown')
        .render('{{ pebble: first }}').should.eventually.eql('<h1 id=\"hello-world\">Hello world</h1>\n');
    });

    //  it('uses the defined templates', function(){
    //   return compiler
    //     .registerEngine('jade', require('jade'))
    //     .registerHook('before.render', pebbleParser )
    //     .includeMarkdownEngine()
    //     .useEngine('markdown')
    //     .render('{{ Pebble: testpebble }}').should.eventually.eql('<h1 id=\"hello-world\">Hello world</h1>\n');
    // });

  });

});
