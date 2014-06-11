/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-10 23:54:09
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 01:11:37
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = function ( compiler, callback ) {
 
  'use strict';  
  var globalContent;

  var _          = require('lodash');
  var fs         = require('fs');
  var join       = require('path').join;
  var async      = require('async');
  var inflection = require('inflection');


  return {
    run: runIt
  };


  function runIt( snippets, content ){
    var compile = runCompiler( compiler );
    globalContent = content;

    async.eachSeries( snippets, compile, function(){
      // console.log('output: ', globalContent );
      // compiler.set('cwd', contentPath );
      callback( globalContent );
    });
  }

  /**
   *  @method runCompiler
   *  @param compiler { Object }
   *  @return { Function }
   */
  function runCompiler( compiler ){
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

      async.eachSeries( items, function( item, nextItem ){
        prepareIfArray( item, compiler, snippet, index);
          
        if( fs.existsSync( join( snippet.path, snippet.name + '.jade' ))){
          console.log('IS CALLED');
          compiler
            .set('cwd',snippet.path ).set('template', snippet.name )
            .initialize();
        }

        compiler
          .registerEngine('jade', require('jade'))         
          .render( item )
          .then( function( html ){ 
            localContent += html;  
            console.log('the local content: ', localContent );
            nextItem(); } 
          ); 
      }, function(){
        //console.log('WRITING: ', globalContent );
        globalContent = globalContent.replace( snippet.original, localContent );
        //console.log('at the end: ', localContent, globalContent, snippet.original );
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
      item = getTranslation( item.translations, compiler.options.lang );
      var arrayName =  snippet.params.name || inflection.singularize( snippet.params.array );
      item.index = index;
      compiler.locals[ arrayName ] = item;
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