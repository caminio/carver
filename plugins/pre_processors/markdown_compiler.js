/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-11 01:53:47
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 02:16:37
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

/**
 *  Compiles the variable 'markdownContent' from the compiler locals with
 *  the markdown engine and replace the original 'markdownContent'.
 *  The passed content will not be modified in any way.
 *  @constructor
 *  @class MarkdownContentPreProcessor
 */
module.exports = function ( content, compiler, resolve ){

  'use strict';

  var carver  = require(__dirname+'/../../index');

  var markdownContent = compiler.options.locals.markdownContent || '';
  carver()
  .includeMarkdownEngine()
  .useEngine('markdown')      
  .render( markdownContent )
  .then( function( html ){ 
     compiler.options.locals.markdownContent = html;
     resolve( content );
  }); 

};