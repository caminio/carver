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
   * determined from the template, respectively referTo(obj)@filename property
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
  Carver.prototype.write = function compile(){

    var compiler = this;
    Array.prototype.slice.call(arguments).forEach(function(arg){
      if( !_.find( compiler.options.destinations, arg ) )
        compiler.options.destinations.push(arg);
    });

    if( !compiler.options.cwd )
      throw new MissingCwdError();

    this.initialize();

    if( !compiler.options.destinations )
      throw new MissingDestinationError();

    var promiseChain = new RSVP.Promise( function(resolve){ resolve(); } );

    promiseChain = promiseChain.then( readInTemplateFile );
    promiseChain = promiseChain.then( renderTemplateFile );
    promiseChain = promiseChain.then( attachPreprocessors );
    promiseChain = promiseChain.then( writeToPaths );

    return promiseChain;

    function renderTemplateFile(){
      var promise = new RSVP.Promise( function( resolve ){
        var templateFilePath = join( compiler.options.cwd, compiler._templateFilename );
        var templateRaw = fs.readFileSync( templateFilePath );
        compiler.render( templateRaw, 'utf8' );
        resolve();
      });
      return promise;
    }

    function attachPreprocessors(content){
      return compiler.createHookChain('beforeWrite', content);
    }

    function readInTemplateFile(){
      return new RSVP.Promise( function( resolve ){
        compiler.render( fs.readFileSync( join(compiler.options.cwd, compiler._templateFilename ), 'utf8' ) );
        resolve();
      });
    }

    function writeToPaths(){
      return RSVP.all( compiler.options.destinations.map( function(dest){
        return checkAndWrite( dest );
      }));
    }

    function checkAndWrite( destination ){

      return new RSVP.Promise( function( resolve ){

        var writerUrl = url.parse( destination );
        if( _.isEmpty(writerUrl.protocol) )
          throw new Error('unknown protocol format '+destination);

        var protocol = writerUrl.protocol.replace(':','');

        if( !Carver.writers[protocol] )
          throw new UnknownWriterError(protocol);

        compiler.options.filename = compiler.options.filename || compiler.options.template;
        var filename = join( writerUrl.href.replace( protocol+'://',''), compiler.options.filename );
        Carver.writers[protocol].write( filename, compiler, resolve );

      });

    }

  };


};
