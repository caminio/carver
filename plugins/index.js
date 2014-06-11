/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-06-11 17:56:54
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-11 18:11:16
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = {
  snippetParser: require('./pre_processors/snippet/snippet_parser')(),
  markdownPre: require('./pre_processors/markdown_content')
};