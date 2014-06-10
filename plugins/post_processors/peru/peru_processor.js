/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 02:03:25
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-06 16:44:02
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = function( caminio ){

  'use strict';

  var async = require('async');
  var PeRuParser = require('./pe_ru_bble_parser')();
  var _ = require('lodash');
  var PeRuCompiler = require('./pe_ru_bble_compiler');
  var PebbleDb = require('./pebble_db');
 
  var webpageId;
  var globalContent;
  var compiler;
  var db;
  var contentPath;
  var errors;

  var Type = { PEBBLE: 'pebble', RUBBLE: 'rubble', MISSMATCH: 'missmatch' };

  /**
   *  Provides a compile method which compiles one snippet with the given local content.
   *  The content must be passed because snippets without layout dependencies have not 
   *  got any content in their body. 
   *  @class PeRuCompiler
   */
  function PeRuProcessor( caminio ){
    db = new PebbleDb( caminio );
  }

  PeRuProcessor.prototype.startSearch = function( content, compiler, resolve ){
    errors = [];
    contentPath = compiler.contentPath;
    globalContent = content;
    var attributes = compiler.locals ? compiler.locals : {};
    attributes.locale = compiler.locale;
    var methods = {
      runJS: compiler.methods.runJS.run,
      compileJade: compiler.methods.layoutCompiler.compile,
      contentCompiler: compiler.methods.contentCompiler
    };
    compiler = new PeRuCompiler( attributes, methods );
    webpageId = attributes.webpage ? attributes.webpage._id : null;
    getSnippets( globalContent, resolve );
  };

  function compileSnippet( snippet, next ){  
    if( ( snippet.type === Type.PEBBLE && snippet.db ) || snippet.type === Type.RUBBLE )
      compiler.compileSnippet( snippet, function( err, localContent ){
        if( err ){ errors.push( err ); }
        globalContent = globalContent.replace( new RegExp( snippet.original, 'g'), localContent );
        getSnippets( localContent, next );     
      });
    else{
      var warning =  "{{ Warning: pebble has no db file or is global! ";
      warning += snippet.original.replace("{{", "");
      globalContent = globalContent.replace( new RegExp( snippet.original, 'g'), warning );
      getSnippets( "", next );     
    }
  }
    
  function getSnippets( content, next ){
    var snippets = PeRuParser.getSnippets( content );
    if( snippets.pebbles.length > 0 || snippets.rubbles.length > 0 ){
      var pebbles = getSnippetObjects( snippets.pebbles, Type.PEBBLE );        
      var rubbles = getSnippetObjects( snippets.rubbles, Type.RUBBLE );
      runSnippets( pebbles, Type.PEBBLE, function(){
        runSnippets( rubbles, Type.RUBBLE, function(){
          next( errors, globalContent ); 
        });
      });
    } else {
      var err = errors.length > 0 ? errors : null;
      next( err, globalContent );   
    }
  }

  function getSnippetObjects( snippets, type ){
    return PeRuParser.makeSnippetObjects( 
      snippets, 
      contentPath + "/" + type + "s/",
      type 
    );        
  }

  function runSnippets( snippets, snippetType, callback ){
    async.eachSeries( snippets, runSnippet, callback );

    function runSnippet( snippet, next ){
      if( snippetType === Type.PEBBLE ){
        db.getData( snippets, webpageId, function( err, dbPebbles ){
          snippet.db = _.find( dbPebbles, { 'name': snippet.name });
          compileSnippet( snippet, next ); 
        });
      }
      else
        compileSnippet( snippet, next );               
    }
  }

  return PeRuProcessor;
}