module.exports = function Writers( Carver ){

  'use strict';

  var _               = require('lodash');
  var join            = require('path').join;
  var dirname         = require('path').dirname;
  var fs              = require('fs');
  var url             = require('url');
  var RSVP            = require('rsvp');
  var MissingCwdError = require('../errors').MissingCwdError;
  var MissingDestinationError = require('../errors').MissingDestinationError;
  var UnknownWriterError = require('../errors').UnknownWriterError;
  var MissingWriterError = require('../errors').MissingWriterError;
  
  /**
   * @method registerWriter
   * @param {String|Array} protocol array can be used, to make writer available under different protocols
   *
   * register a new writer for given protocol
   *
   */
  Carver.registerWriter = function registerWriter( names, writer ){
    
    if( typeof(names) === 'string' )
      names = [ names ];

    _.each( names, function(name){
      this.writers[name] = writer;
    }, this );

  };

  Carver.prototype.registerWriter = function registerWriter( names, writer ){
    this.constructor.registerWriter( names, writer );
    return this;
  };

  /**
   * trigger initialization (checks for valid options) and writes output to given path(s). The filename will be
   * determined from the template, respectively document@filename property
   *
   * @method write
   * @param {String} [path] optional path will be appended to options.destinations array
   * 
   * @example
   *
   *     carver()
   *       ...
   *       .write( '/path/to/folder' )
   *       .then( function(){
   *         // .. finish your processing
   *       });
   *
   *
   *     carver()
   *       ...
   *       .write()
   *       .then( function(){ // continue your processing });
   *
   *     carver()
   *       ...
   *       .write( '/path/one','/path/two' )
   */
  Carver.prototype.write = function write(){

    var compiler = this;
    Array.prototype.slice.call(arguments).forEach(function(arg){
      if( !_.find( compiler.options.destinations, arg ) )
        compiler.options.destinations.push(arg);
    });

    if( !compiler.options.cwd )
      throw new MissingCwdError();

    if( _.keys(compiler.writers).length < 1 )
      throw new MissingWriterError();

    this.initialize();

    if( !compiler.options.destinations )
      throw new MissingDestinationError();

    return this.contentArrayPromiseChain();

  };

  /**
   * dispatch all different kinds of content found in
   * the @options.manyKey (if present) and trigger
   * #render method for each of those contents
   *
   * If no manyKey was found in .options.doc or no .options.doc is 
   * present, the array will just contain the default
   * content (brought together by other settings)
   *
   * @method contentArrayPromiseChain
   * @private
   */
  Carver.prototype.contentArrayPromiseChain = function contentArrayPromiseChain(){
 
    var compiler = this;

    var renderLangs = [];
    if( compiler.options.doc && compiler.options.doc[compiler.options.manyKey] && compiler.options.doc[compiler.options.manyKey].length > 0 )
      compiler.options.doc[compiler.options.manyKey].forEach(function(translation){
        renderLangs.push( translation[compiler.options.langKey] );
      });

    if( renderLangs.length < 1 || compiler.options.langlessCopy )
      renderLangs.push( undefined );

    var allWrittenPromise = RSVP.all( renderLangs.map( function(lang){ return compiler.contentLangWriter( lang ); }) );
    allWrittenPromise.then( function(){ return compiler.runDependencies(); } );
    return allWrittenPromise;

  };

  /**
   * renders and writes the content for the given
   * language
   *
   * @method contentLangWriter
   * @param {String} lang the language to write
   * @private
   */
  Carver.prototype.contentLangWriter = function contentLangWriter( lang ){

    var compiler = this;
    compiler.options.lang = lang; // <-- that one does not work

    var promiseChain = new RSVP.Promise( function(resolve){ resolve(); } );

    // promiseChain = promiseChain.then( readInTemplateFile );
    promiseChain = promiseChain.then( renderTemplateFile );
    promiseChain = promiseChain.then( attachPreprocessors );
    promiseChain = promiseChain.then( writeToDrafts );
    promiseChain = promiseChain.then( writeToPaths );

    return promiseChain;

    function renderTemplateFile(){
      var templateFilePath = join( compiler.options.cwd, compiler._templateFilename );
      var templateRaw = fs.readFileSync( templateFilePath, 'utf8' );
      return compiler.render( templateRaw, lang );
    }

    function attachPreprocessors(content){
      return compiler.createHookChain('before.write', content);
    }

    function writeToPaths(content){
      return RSVP.all( compiler.options.destinations.map( function(dest){
        return checkAndWrite( dest, content );
      }));
    }

    function writeToDrafts(content){
      if( !compiler.options.doc || !compiler.options.doc[compiler.options.primaryKey] || typeof(compiler.options.drafts) !== 'string' )
        return new RSVP.Promise( function( resolve ){ resolve(content); });
      var filename = compiler.options.doc[compiler.options.primaryKey].toString();
      return checkAndWrite( compiler.options.drafts, content, { filename: filename, draft: true } );
    }

    function checkAndWrite( destination, content, options ){

      options = options || {};

      return new RSVP.Promise( function( resolve ){

        if( compiler.options.doc && !options.draft && compiler.options.doc[compiler.options.publishingStatusKey] !== 'published' )
          return resolve();

        compiler.options.lang = lang; // <-- strange, why I had to put this in here, not on top of promise builder
        var writerUrl = url.parse( destination );
        if( _.isEmpty(writerUrl.protocol) )
          throw new Error('unknown protocol format '+destination);

        var protocol = writerUrl.protocol.replace(':','');

        if( !Carver.writers[protocol] )
          throw new UnknownWriterError(protocol);

        compiler.options.filename = compiler.options.filename || compiler.options.template;

        var filename = join( writerUrl.href.replace( protocol+'://',''), ( options.filename || compiler.options.filename ) );

        if( typeof(compiler.options.dir) === 'string' && !options.draft )
          filename = join( writerUrl.href.replace( protocol+'://',''), compiler.options.dir, (options.filename || compiler.options.filename) );

        Carver.writers[protocol].write( filename, content, compiler, resolve );

      });

    }

  };


};
