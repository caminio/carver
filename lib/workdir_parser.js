module.exports = function refer( Carver ){

  'use strict';

  var fs                    = require('fs');
  var _                     = require('lodash');
  var join                  = require('path').join;
  var extname               = require('path').extname;
  var TemplateNotFoundError = require('./errors').TemplateNotFoundError;
  var UnknownEngineError    = require('./errors').UnknownEngineError;
  var MissingEngineError    = require('./errors').MissingEngineError;

  /**
   * Parses the cwd for controller and adds it to the
   * middleware process flow
   *
   * @method parseCwd
   * @private
   */
  Carver.prototype.parseCwd = function parseCwd(){

    if( !this.options.cwd )
      return;

    var compiler = this;
    compiler._useEngine = null; // reset _useEngine. Must match template file

    fs
      .readdirSync( compiler.options.cwd )
      .forEach( function( filename ){ 
        if( filename === compiler.options.template+'.hooks.js' )
          return compiler.requireAndParseHooks( filename );
        var re = new RegExp('^'+compiler.options.template+'.[a-z]{2,12}$');
        if( filename.match(re) )
          return compiler.checkTemplate( filename );
      });

    if( !compiler._useEngine )
      throw new TemplateNotFoundError( compiler.options.cwd, compiler.options.template );

  };

  /**
   * Parses the given filename for a valid js
   * file and for keys known to the hook system
   *
   * @method requireAndParseHooks
   * @param {String} filename
   * @private
   */
  Carver.prototype.requireAndParseHooks = function requireAndParseHooks( filename ){
    var compiler = this;
    if( process.env.NODE_ENV === 'development' )
      delete require.cache[ join( compiler.options.cwd, filename ) ];
    var preprocessor = require( join( compiler.options.cwd, filename ) );
    Carver.knownHooks().forEach( function( hookName ){
      if( hookName in preprocessor )
        compiler.registerHook( hookName, preprocessor[hookName], false );
    });
  };

  /**
   * checks a template file and checks if an according engine
   * is available
   *
   * @method filename
   * @param {String} templateFile
   * @private
   */
  Carver.prototype.checkTemplate = function checkTemplate( filename ){
    var compiler = this;
    var ext = extname(filename).replace('.','');

    if( _.keys(compiler.constructor.engines).length < 1 )
      throw new MissingEngineError();

    if( !(ext in compiler.constructor.engines) )
      throw new UnknownEngineError( filename );

    compiler._templateFilename = filename;
    Carver.logger.debug('using template',filename,'and engine',ext);
    compiler._useEngine = compiler.constructor.engines[ext];

  };

};
