/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-11 17:56:54
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 22:48:30
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = {
  snippetParser: require('./post_processors/snippet/snippet_parser')(),
  markdownCompiler: require('./pre_processors/markdown_compiler')
};