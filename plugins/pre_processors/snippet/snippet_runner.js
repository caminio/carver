/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-10 23:54:09
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 13:27:11
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = function ( compiler, keyword, callback ) {
 
  'use strict';  
  var globalContent;

  var _          = require('lodash');
  var fs         = require('fs');
  var join       = require('path').join;
  var async      = require('async');
  var inflection = require('inflection');
  var markdownHook = require(__dirname+'/../markdown_content');
  var carver       = require(__dirname+'/../../../index');


  return {
    run: runIt
  };


  function runIt( snippets, content ){
    var compile = runCompiler( compiler );
    var origPath = compiler.options.cwd;
    globalContent = content;
    async.eachSeries( snippets, compile, function(){
       //console.log('output: ', globalContent );
      compiler.set('cwd', origPath );
      callback( globalContent );
    });
  }

  /**
   *  @method runCompiler
   *  @param compiler { Object }
   *  @return { Function }
   */
  function runCompiler( compiler ){

    compiler
      .clearEngines()
      .registerEngine('jade', require('jade'));

    /**
     *  @param snippet
     *  @param nextSnippet
     */
    return function( snippet, nextSnippet ){
      var array = snippet.params.array;
      var items = array ? compiler.options.locals[array] : [ snippet.content ];
      var localContent = '';
      var index = 0;

      if( !items )
        items = [];

      compiler.options.locals[keyword] = snippet;
      console.log('running: ', snippet );
      async.eachSeries( items, function( item, nextItem ){
        prepareIfArray( item, compiler, snippet, index);

        compiler.options.locals.markdownContent =  typeof item === 'string' ? item : '';

        var layout = '!=markdownContent';
        var jadeFile = join( snippet.path, snippet.name + '.jade' );
        var hasJade = fs.existsSync( jadeFile );
        var hasJs = fs.existsSync( join( snippet.path, snippet.name + '.js' ) );
        if(  hasJade  ){  
          layout = fs.readFileSync( jadeFile, 'utf8');
          compiler
            .set('cwd',snippet.path ).set('template', snippet.name );
        }

        if( hasJade || hasJs )
          compiler
            .registerEngine('jade', require('jade'))         
            .initialize();

        console.log('jade: ', compiler.options.locals );

        compiler
          .registerHook('before.render', markdownHook )
          .registerEngine('jade', require('jade'))         
          .render( layout )
          .then( function( html ){ 
            console.log('HTML: ', html );
            localContent += html;  
            nextItem(); } 
          ); 
      }, function(){
          globalContent = globalContent.replace( snippet.original, localContent );
          nextSnippet();
      });
    };
  }

  /**
   *  @method prepareIfArray
   *  @param item
   */
  function prepareIfArray( item, compiler, snippet, index){
    if( !item )
      item = '';
    if( typeof item !== 'string' ){
      var arrayName =  snippet.params.name || inflection.singularize( snippet.params.array );
      item.index = index;
      compiler.options.locals[ arrayName ] = item;
      item = getTranslation( item.translations, compiler.options.lang );
      index++;
    }
  }

  /**
   *  @methdo getTranslation
   *  @param translations
   *  @param curLang
   */
  function getTranslation( translations, curLang ){
    if( !translations )
      return 'NO TRANSLATION FOUND';
    return _.find( translations, { 'locale': curLang }).content; 
  }

};