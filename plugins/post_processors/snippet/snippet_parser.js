/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-06 17:09:41
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-14 10:37:22
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = function () {

  'use strict';

  var _          = require('lodash');
  var join       = require('path').join;
  var inflection = require('inflection');

  /**
   *  @constructor
   *  @param content { String }
   *  @param compiler { Object }
   *  @param resolve { Function }
   */
  function SnippetParser( content, compiler, resolve ){
    var contentPath = compiler.options.cwd;
    if( contentPath === null)
      contentPath = '';
    var keyword = compiler.options.snippetKeyword || 'snippet';
    var snippets = getSnippets( content, keyword, contentPath );
    getSnippetsContent( snippets, keyword, compiler.options );
    var runner = require('./snippet_runner')(compiler, keyword, resolve);
    runner.run( snippets, content );
  } 

  /**
   *  @method getSnippetsContent
   *  @param snippets { Array }
   *  @param keyword { String }
   *  @param options { Object }
   */
  function getSnippetsContent( snippets, keyword, options ){
    var curLang = options.pebbleLang || options.lang;
    var locals = options.locals;
    var dbKeyword = inflection.pluralize( keyword );

    if( locals.doc && locals.doc[dbKeyword] )
      snippets.forEach( function( curSnippet ){
        var data = _.find( locals.doc[dbKeyword], { 'name': curSnippet.name });
        if( data ){
          curSnippet.content = getTranslation( data.translations, curLang );
          curSnippet._id     = data._id;
        }
        else
          curSnippet.content = '{{ ' + curSnippet.name + ': NO CONTENT FOUND IN OBJECT, did you forget to send an object with translations? }}';
      });

    return snippets;
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

  function buildSnippetRegexp( keyword ){
    return new RegExp( '^{{\\s*' + keyword + '(:|( :))', 'gi' );
  }

  /**
   *  @method getSnippets
   *  @param contetn { String }
   */
  function getSnippets( content, keyword, path ){
    var originalStrings = content.match(/{{[^{}]*}}/g);
    var snippets = [];

    if( originalStrings !== null )
      originalStrings.forEach( function( original ){

        var isSnippet = original.match( buildSnippetRegexp( keyword ) );
        if( isSnippet instanceof Array )
          snippets.push( toSnippetObject( original, path, keyword ));
      });

    return snippets;
  }

  /** 
   *  @private
   *  @method toSnippetObject
   *  @param originalSnippet { String }
   *  @return { Object }
   */
  function toSnippetObject( original, path, keyword ){
    var snippet = {
      original: original
    };

    var params = original.replace( '{{', '' ).replace( '}}', '' );
    params = params.split( ',' );
    snippet.name = replaceAll(' ', '', params[0].split(':')[1] );
    params.shift();
    snippet.params = splitKeyValueArray( params );
    snippet.path = join( path, inflection.pluralize( keyword ) );

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
