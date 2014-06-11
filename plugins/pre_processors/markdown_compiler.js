/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-11 01:53:47
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 20:14:32
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

/**
 *  Compiles the content or current translation content from doc with
 *  the markdown engine and puts it into  the 'markdownContent' variable.
 *  The passed content will not be modified in any way.
 *  @constructor
 *  @class MarkdownContentPreProcessor
 */
module.exports = function ( content, compiler, resolve ){

  'use strict';

  var _ = require('lodash');

  var carver  = require(__dirname+'/../../index');
  var tempCompiler = carver();

  var doc = compiler.options.locals.doc;
  var lang = { 'locale': compiler.options.lang };
  var markdownContent = getContent( doc, lang );
  
  if( compiler.options.cwd )
    tempCompiler.set('cwd', compiler.options.cwd );

  tempCompiler
  .includeMarkdownEngine()
  .useEngine('markdown')   
  .registerHook('before.render', require('./snippet/snippet_parser')() )   
  .render( markdownContent )
  .then( function( html ){ 
     compiler.options.locals.markdownContent = html;
     resolve( content );
  }); 

  function getContent( doc, lang ){
    if( typeof doc === 'string' )
      return doc;
    if( doc.content )
      return doc.content;
    if( doc.translations )
        return _.find( doc.translations, lang ).content;
    return '';
  }

};