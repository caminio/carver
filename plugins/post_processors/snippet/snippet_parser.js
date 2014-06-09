/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-06 17:09:41
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-09 11:28:40
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = function ( Carver ) {

  'use strict';

  var snippetRegexp;
  var contentPath;

  var join = require('path').join;
  var async = require('async');
  
  var _ = require('lodash');
  var inflection = require('inflection');

  /**
   *  @constructor
   *  @param content { String }
   *  @param compiler { Object }
   *  @param resolve { Function }
   */
  function SnippetParser( content, compiler, resolve ){

    contentPath = compiler.options.cwd;
    snippetRegexp = buildSnippetRegexp();

    var snippets = getSnippets( content );
    console.log('after getting: ', snippets );
    // TODO: get translations, arrays ...
    snippets = getContent( snippets, 'pebbles', compiler.options );

    console.log( 'WE GOT: ', snippets  );   

    var compile = runCompiler( content, compiler );

    async.eachSeries( snippets, compile, function(){
      resolve( content );
    });

    // throw errors
    // resolve( content )

  }

  function runCompiler( content, compiler ){
    return function( snippet, nextSnippet ){
      var items = snippet.params.array ? snippet.params.array : [ snippet.content ];
      var localContent = '';
      var index = 0;

      async.each( items, function( item, nextItem ){

        if( typeof item !== 'string' ){
          item = getTranslation( item.translations, compiler.options.lang );
          var arrayName =  snippet.params.name || inflection.singularize( snippet.params.array );
          item.index = index;
          compiler.locals[ arrayName ] = item;
          index++;
        }

        compiler.render( item ) .then( function( html ){ localContent += html; nextItem(); } ); 
      }, function(){
        content.replace( snippet.original, localContent );
        nextSnippet();
      });
    };
  }

  function replaceContent( snippet, content ){
    return function( html ){
      content.replace( snippet.original, html );
    };
  }

  function getContent( snippets, keyword, options ){
    // get the current translation from the locals object
    var curLang = options.lang;
    var locals = options.locals;

    console.log( locals );

    if( !locals.doc || !locals.doc[keyword] )
      throw new Error('no keyword');

    snippets.forEach( function( curSnippet ){
      var data = _.find( locals.doc[keyword], { 'name': curSnippet.name });
      console.log('DATA: ', data );
      curSnippet.content = getTranslation( data.translations, curLang );
    });

    return snippets;
  }

  function getTranslation( translations, curLang ){
    if( !translations )
      return '';
    return _.find( translations, { 'locale': curLang }).content; 
  }

  function buildSnippetRegexp( alternativKeyword ){
    var keyword = 'snippet' || alternativKeyword ;
    return new RegExp( '^{{\\s*' + keyword + '(:|( :))', 'gi' );
  }

  /**
   *  @method getSnippets
   *  @param contetn { String }
   */
  function getSnippets( content ){
    var originalStrings = content.match(/{{[^{}]*}}/g);
    var snippets = [];
    originalStrings.forEach( function( original ){
      var isSnippet = original.match( snippetRegexp );
      if( isSnippet instanceof Array )
        snippets.push( toSnippetObject( original ));
      else 
        console.log( 'TODO ' );
    });

    return snippets;
  }

  /** 
   *  @private
   *  @method toSnippetObject
   *  @param originalSnippet { String }
   *  @return { Object }
   */
  function toSnippetObject( original ){
    var snippet = {
      original: original
    };

    var params = original.replace( '{{', '' ).replace( '}}', '' );
    params = params.split( ',' );
    snippet.name = replaceAll(" ", "", params[0].split(':')[1] );
    params.shift();
    snippet.params = splitKeyValueArray( params );
    snippet.path = join( contentPath, 'snippets', snippet.name );

    return snippet;
  }



  /**
   *  Writes the params into a hash object
   *  @private
   *  @method splitKeyValueArray
   *  @param arr [ { String }]
   *  @return hash { Object } The hash object with the params
   */
  function splitKeyValueArray( arr ){
    var hash = {};

    arr.forEach( function( element ){
      element = replaceAll( ' ', '', element );
      var split = element.split( "=" );
      hash[ split[0] ] = split[1];
    });

    return hash;
  }



  /**
   *  Replaces all strings in another string
   *  @private
   *  @method replace All
   *  @param find
   *  @param replace
   *  @param str
   */
  function replaceAll(find, replace, str) {
    return str.replace(new RegExp( find, 'g'), replace );
  }



  return SnippetParser;

};