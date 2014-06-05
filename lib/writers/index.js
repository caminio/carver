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
   * trigger initialization (checks for valid options) and writes output to given filename
   *
   * @method write
   * @param {String} [filename] optional filename (if no filename is given and .referTo has been initialized, carver will try to read filename from the obj)
   * 
   * @example
   *
   *     carver()
   *       ...
   *       .write( '/path/to/file' )
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
   *       .write(['/path/one','/path/two'])
   */
  Carver.prototype.write = function compile( filename ){

    var compiler = this;
    this.checkValidWriter();
    this.addFilename(filename);

    this.initialize();

    //var deferred = RSVP.defer();

    //this
    //  .render( fs.readFileSync( join(this.options.cwd, this._templateFilename ), 'utf8' ) )
    //  .then( doPreprocessWriter );
    //    
    //return deferred.promise;

    //function doPreprocessWriter( htmlContent ){
    //  var chain = compiler.createHookChain('beforeWrite');
    //  chain.then( doWrite, writeError );
    //}

    //function doWrite(){
      var writers =  compiler.getPathPromises();
      return RSVP.all( writers );
    //}

    function writeError(err){
      console.error('write error', err);
    }

  };

  /**
   * @method checkValidWriter
   * @private
   */
  Carver.prototype.checkValidWriter = function checkValidWriter(){
    if( !this.options.cwd )
      throw new MissingCwdError();

    if( !this.options.destination )
      throw new MissingDestinationError();

    var writerUrl = url.parse( this.options.destination );
    if( typeof(writerUrl.protocol) !== 'string' )
      throw new Error('unknown protocol format '+this.options.destination);

    var protocol = writerUrl.protocol.replace(':','');

    if( !(protocol in this.constructor.writers ) )
      throw new UnknownWriterError(protocol);

    this._destinations = this._destinations || [];
    this._destinations.push( writerUrl.href.replace( protocol+'://','') );
    this._useWriter = this.constructor.writers[protocol];

  };

  /**
   * @method addFilename
   * @param {String} [filename]
   * @private
   */
  Carver.prototype.addFilename = function addFilename(filename){
  
    if( typeof(filename) === 'string' )
      this.options.filename = filename;

    if( !this.options.filename )
      this.options.filename = this.options.template;

  };

  /**
   * @method getPathPromises
   * @return {Array} full qualified path names
   * @private
   *
   * collect an array of filenames
   */
  Carver.prototype.getPathPromises = function getPathPromises(){
    var compiler = this;
    return this._destinations.map( function(destination){
      return new RSVP.Promise( function( resolve ){
        var filename = destination + '/' + compiler.options.filename;
        compiler._useWriter.write( filename, compiler, resolve );
      });
    });
  };

};
