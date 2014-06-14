/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-10 23:54:09
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-14 10:37:48
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
  var markdownHook = require(__dirname+'/../../pre_processors/markdown_compiler');

  return {
    run: runIt
  };


  function runIt( snippets, content ){
    var compile = runCompiler( compiler );
    globalContent = content;
    async.eachSeries( snippets, compile, function(){
      callback( globalContent );
    });
  }


  function getItems( snippet, compiler ){

    var array = snippet.params.array;
    var items = array ? compiler.options.locals[array] : [ snippet.content ];

    if( !items )
      items = [];

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
    var tempCompiler = compiler.clone();

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

      tempCompiler.options.locals[keyword] = snippet;

      async.eachSeries( items, processItem, function(){
          globalContent = globalContent.replace( snippet.original, localContent );
          nextSnippet();
      });

      function processItem( item, nextItem ){
        prepareIfArray( item, compiler, snippet, index, tempCompiler);
        index++;

        tempCompiler.options.locals.doc = setDoc( item, snippet );
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

  function setDoc( item, snippet ){
    if( !item )
      return { _id: snippet._id, content: '' };
    if( typeof item !== 'string' ){
      item._id = snippet._id;
      return item;
    }
    else{
      return { _id: snippet._id, content: item };
    }

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
    var translation = _.find( translations, { 'locale': curLang });
    return translation ? translation.content : 'NO TRANSLATION FOUND WITH GIVEN LOCALE'; 
  }

};
