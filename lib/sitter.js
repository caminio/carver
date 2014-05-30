/**
 * sitter
 *
 * the main compiler is returned here
 */

module.exports = function SitterExport(){

  'use strict';

  var fs        = require('fs');
  var join      = require('path').join;
  var extname   = require('path').extname;
  var basename  = require('path').basename;
  var _         = require('lodash');
  var async     = require('async');

  var Logger    = require( __dirname+'/logger' )();

  var defaultOptions = {

    workDir: null,

    defaultLocale: 'en'

  };

  /**
   * @class Sitter
   * @constructor
   */
  function Sitter(){
    this.logger = new Logger();
  }

  /**
   * @method init
   * @param options {Object}
   *
   * Available options
   */
  Sitter.init = function initSitter( options ){

    //if( !options.workdir )
    //  throw new Error('missing option [workdir] to initialize at current working directory');

    var compiler = new Sitter();

    compiler.options = options || {};
    compiler.options.locals = compiler.options.locals || {};

    for( var i in defaultOptions )
      if( !(i in compiler.options) )
        compiler.options[i] = defaultOptions[i];

    compiler.setupWorkdir();
    
    compiler.logger.debug('sitter compiler initialized at ', compiler.cwd || ' string return level');

    return compiler;

  };

  /**
   * @method compile
   * @param content {String} [optional]
   * @param options {Object} [optional]
   * @param callback {Function} [optional]
   * @return compiledContent {String} only, if content object is a string
   *
   * Available options
   */
  Sitter.prototype.compile = function compile( content, options, cb ){

    if( typeof(options) === 'function' ){
      cb = options;
      options = {};
    }

    options = options || {};
    options.engine = options.engine || 'plaintext';

    if( options.locals )
      this.options.locals = _.merge( this.options.locals, options.locals );

    var self = this;

    if( this.cwd )
      return this.compileWorkdir( content, options, function( options ){ return self.compileContent( content, options, cb ); });

    var res = this.compileContent( content, options, cb );
    return res;

  };

  /**
   * @method compileContent
   * @private
   */
  Sitter.prototype.compileContent = function compileContent( content, options, cb ){

    var self = this;

    if( content && typeof(content) === 'object' )
      return this.compileObject( content, options, cb );
    
    if( !(options.engine in Sitter.engines ) )
      throw new Error('don\'t know how to compile '+options.templateFile+' (missing engine '+ options.engine+')');

    return Sitter.engines[options.engine].compile( content, options, continueContent );

    function continueContent(err, result){
    
      if( self.workdirSettings && self.workdirSettings.destination )
        return self.writeToDestination( result, options, cb );

      return typeof(cb) === 'function' ? cb(err, result) : result;

    }

  };

  /**
   * @method setupWorkdir
   * @private
   */
  Sitter.prototype.setupWorkdir = function setupWorkdir(){

    if( !this.options.workdir )
      return;

    this.cwd = this.options.workdir;

    if( !fs.existsSync( this.cwd ) )
      throw new Error('sitter initialized with workdir but ' + this.cwd + ' was not found');

    var settingsJS = join( this.cwd, '.settings.js' );

    if( !fs.existsSync( settingsJS ) )
      fs.writeFileSync( settingsJS, fs.readFileSync( join(__dirname, 'templates', '.settings.js')) );

    this.workdirSettings = require( settingsJS );

  };

  /**
   * @method compileWorkdir
   * @param content {String}
   * @param options {Object}
   * @private
   */
  Sitter.prototype.compileWorkdir = function compileWorkdir( content, options, cb ){
    options.template = options.template || 'index';
   
    if( typeof(content) === 'object' ){
      if( content.layout )
        options.template = content.layout;
      if( content.template )
        options.template = content.template;
    }

    var templatePath = join( this.cwd, options.template );

    if( !fs.existsSync( templatePath ) )
      throw new Error('You are compiling with a workdir. That requires a template to be set up in ' + templatePath + ' or you define your own template name via the "template" compile-option' );

    var templateFile;

    var templateFiles = fs
      .readdirSync( templatePath )
      .filter( function( file ){ 
        if( basename(file, extname(file)) === options.template && extname(file) !== '.js' ) 
          return true; 
      });

    templateFiles.forEach( function( file ){
      if( extname(file) === '.'+options.engine )
        templateFile = join( templatePath, file );
    });

    if( !templateFile && templateFiles.length > 0 )
      templateFile = join( templatePath, templateFiles[0] );

    if( !templateFile )
      throw new Error('failed to find a matching template file for '+options.template+' in '+templatePath);

    var engine = extname(templateFile).replace('.','');

    return cb( _.merge( options, { engine: engine, templateFile: templateFile }) );

  };

  /**
   * @method compileObject
   * @param obj {Object}
   * @param options {Object}
   * @param callback {Function}
   *
   * tries to find a content property inside the object
   * The content can be either in the root of the object
   * or inside a translations array.
   *
   * If a translations array is found, each translation
   * will be processed
   *
   * - options
   *
   *   will be passed back to the compile method (see there for documentation)
   */
  Sitter.prototype.compileObject = function compileObject( obj, options, cb ){
    var self = this;

    if( typeof(obj.content) === 'string' )
      return this.compileContent( obj.content, _.merge( { locale: ( obj.locale || null ),
                                                          template: ( obj.template || obj.layout || null ),
                                                          locals: { doc: obj },
                                                          filename: (obj.filename || obj.name || null)}, options), cb );
    
    if(!(typeof(obj.translations) === 'object' && obj.translations instanceof Array )){
      this.logger.error('object does not provide a content nor a translations property', obj);
      return cb();
    }

    var translation;

    // if locale is given, only compile that locale
    // and pass result back
    if( options.locale ){
      translation = _.find( obj.translations, { locale: options.locale });
      if( !translation )
        this.logger.debug('translation ' + options.locale + ' not found for obj', obj);
      return this.compileObject( (translation ? translation : ''), options, cb );
    }

    if( this.options.defaultLocale ){
      translation = _.find( obj.translations, { locale: this.options.defaultLocale });
      if( translation )
        this.compileObject( (translation ? translation : ''), _.merge( _.merge({}, options), { locale: null} ) );
      else
        this.logger.debug('translation ' + this.options.defaultLocale + ' not found for obj', obj);
    }

    // compile all translations
    // no passing back possible
    async.eachSeries( obj.translations, function( translation, nextTranslation ){
      self.compileObject( translation, options, nextTranslation );
    }, cb);

  };

  /**
   * @method writeToDestination
   * @param htmlContent {String}
   *
   * writes to destination set up in .settings.js of workdir
   */
  Sitter.prototype.writeToDestination = function writeToDestination( htmlContent, options, cb ){
    
    var dst = this.workdirSettings.destination;
    var protocol = dst.indexOf('//') > 0 ? dst.split('//')[0] : 'native';

    if( !(protocol in Sitter.writers) )
      throw new Error('sitter compiler could not find a matching writer for '+protocol );

    Sitter.writers[protocol]( htmlContent, (options.filename || null), _.merge( { locals: _.merge( _.merge( {}, this.options.locals ), options.locals ), 
                                                                                   cwd: this.cwd, 
                                                                                   locale: options.locale,
                                                                                   logger: this.logger,
                                                                                   template: options.template }, this.workdirSettings ), cb );

  };


  /**
   * @method registerEngine
   * @param names {String|Array} array can be used, to make engine available under different file extensions
   *
   * register a new compiler engine
   *
   */
  Sitter.registerEngine = function registerEngine( names, engine ){
    Sitter.engines = Sitter.engines || {};
    
    if( typeof(names) === 'string' )
      names = [ names ];

    names.forEach(function(name){
      Sitter.engines[name] = engine;
    });

  };

  /**
   * @method registerWriter
   * @param names {String|Array} should match a protocol (e.g.: ftp, smb, ...)
   */
  Sitter.registerWriter = function registerWriter( names, writer ){
  
    Sitter.writers = Sitter.writers || {};
    
    if( typeof(names) === 'string' )
      names = [ names ];

    names.forEach(function(name){
      Sitter.writers[name] = writer;
    });

  };

  Sitter.registerEngine( ['markdown','md'], require(__dirname+'/engines/markdown' ) );
  Sitter.registerEngine( ['plaintext', 'text'], require(__dirname+'/engines/plaintext' ) );
  Sitter.registerEngine( 'jade', require(__dirname+'/engines/jade' ) );

  Sitter.registerWriter( ['file', 'native'], require( __dirname+'/writers/file' ) );

  return Sitter;

};
