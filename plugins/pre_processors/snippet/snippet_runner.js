/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-10 23:54:09
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 20:22:10
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
  var markdownHook = require(__dirname+'/../markdown_compiler');

  return {
    run: runIt
  };


  function runIt( snippets, content ){
    var compile = runCompiler( compiler );
    globalContent = content;
    console.log(globalContent, snippets);
    async.eachSeries( snippets, compile, function(){
      callback( globalContent );
    });
  }


  function getItems( snippet, compiler ){

    var array = snippet.params.array;
    var items = array ? compiler.options.locals[array] : [ snippet.content ];

    if( !items )
      items = [];

    compiler.options.locals[keyword] = snippet;

    return items;
  }

  function getLayout ( snippet, compiler ) {
    
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
        .initialize();

    return layout;
  }

  /**
   *  @method runCompiler
   *  @param compiler { Object }
   *  @return { Function }
   */
  function runCompiler( compiler ){
    console.log('HERE', compiler );
    try{
    var tempCompiler = compiler.clone();
  }catch(ex){ console.log(ex);}
    tempCompiler
      .clearEngines()
      .registerEngine('jade', require('jade'));

    /**
     *  @param snippet
     *  @param nextSnippet
     */
    return function( snippet, nextSnippet ){
      var items = getItems( snippet, compiler );
      var localContent = '';
      var index = 0;

      async.eachSeries( items, processItem, function(){
          globalContent = globalContent.replace( snippet.original, localContent );
          nextSnippet();
      });

      function processItem( item, nextItem ){
        prepareIfArray( item, compiler, snippet, index, tempCompiler);
        index++;

        tempCompiler.options.locals.doc =  item ? item : '';
        var layout = getLayout( snippet, tempCompiler );

        tempCompiler
          .registerHook('before.render', markdownHook )   
          .useEngine('jade')
          .render( layout )
          .then( function( html ){ 
            localContent += html;  
            nextItem(); } 
          ); 
      }
    };
  }

  /**
   *  @method prepareIfArray
   *  @param item
   */
  function prepareIfArray( item, compiler, snippet, index, tempCompiler ){
    if( !item )
      item = '';
    if( typeof item !== 'string' ){
      var arrayName =  snippet.params.name || inflection.singularize( snippet.params.array );
      item.index = index;
      tempCompiler.options.locals[ arrayName ] = item;
      item = getTranslation( item.translations, compiler.options.lang );
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