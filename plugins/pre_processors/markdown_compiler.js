/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-11 01:53:47
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-30 18:40:25
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

  if( !doc )
    return resolve(content);

  var lang = { 'locale': compiler.options.lang };
  var markdownContent = getContent( doc, lang );
  var markdownAside = typeof(doc) === 'object' && doc.curTranslation && doc.curTranslation.aside ? doc.curTranslation.aside : undefined;

  if( compiler.options.cwd )
    tempCompiler.set('cwd', compiler.options.cwd );

  var keyword = compiler.options.snippetKeyword || 'snippet';
  tempCompiler.set('snippetKeyword', keyword );

  tempCompiler
  .includeMarkdownEngine()
  .useEngine('markdown')   
  .registerHook('after.render', require('../post_processors/snippet/snippet_parser')() )   
  .render( markdownContent )
  .then( function( html ){ 
    html = '<div id=markdown_' + doc._id + '>' + html + '</div>';
    compiler.options.locals.markdownContent = html;
    if( !markdownAside )
      return resolve(content);
    tempCompiler.clone()
      .includeMarkdownEngine()
      .useEngine('markdown')
      .registerHook('after.render', require('../post_processors/snippet/snippet_parser')() )   
      .render( markdownAside )
      .then( function( html ){
        html = '<div id=markdown_aside_' + doc._id + '>' + html + '</div>';
        compiler.options.locals.markdownAside = html;
        resolve(content);
      });
  }); 

  function getContent( doc, lang ){
    if( typeof doc === 'string' )
      return doc;
    if( doc.content )
      return doc.content;
    if( doc.translations && _.find( doc.translations, lang ) )
        return _.find( doc.translations, lang ).content;
    return '';
  }

};
