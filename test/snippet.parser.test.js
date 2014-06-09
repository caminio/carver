/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-06 18:15:08
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-10 00:11:04
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

  var wd4Path               = helper.getSupportDir('wd4');
  var pebbleParser = require(__dirname+'/../plugins/post_processors/snippet/snippet_parser')( Carver );
  var compiler = carver()
                  .set({ cwd: wd4Path})
                  .includeMarkdownEngine()
                  .useEngine('markdown');


  describe('pebble_parser test', function(){

    it('gets a content string', function( done ){

      var testcontent = '{{ Snippet: first }}, {{ Snippet: second }}';

      compiler.options.locals.doc ={ pebbles: [
      {
        name: 'first',
        translations: [{
          locale: 'en',
          content: '# Hello world'
        }]
      }]};

      pebbleParser( testcontent, compiler, function( content ){
        //expect( content ).to.eq( testcontent );
        done();
      });
    });

    it('can be registered as before.render hook', function(){
      return compiler
        .registerEngine('jade', require('jade'))
        .registerHook('before.render', pebbleParser )
        .render('{{ Snippet: first }}').should.eventually.eql('?????');
    });

  });

  // describe( '#includeMarkdownEngine', function(){

  //   it('includes the default markdown engine', function(){
  //     var compiler = carver().includeMarkdownEngine();
  //     expect( Carver.engines ).to.have.property('markdown');
  //     expect( Carver.engines ).to.have.property('md');
  //   });

  // });

  // describe( '#includeFileWriter', function(){

  //   it('includes the default file writer', function(){
  //     var compiler = carver().includeFileWriter();
  //     expect( Carver.writers ).to.have.property('file');
  //   });

  // });

});
