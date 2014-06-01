/**
 * carver
 *
 * the main compiler is returned here
 */

module.exports = function CarverExport(){

  'use strict';

  var fs        = require('fs');
  var join      = require('path').join;
  var extname   = require('path').extname;
  var basename  = require('path').basename;
  var _         = require('lodash');
  var async     = require('async');

  var Logger    = require( __dirname+'/logger' )();

  var defaultConfig = {

    workdir: null,

    defaultLocale: 'en',

    enableLangSuffix: true,

    multiLangs: false,

    prettyHtml: false,

    locals: { doc: null, curLang: 'en' },

    skipDependencies: []

  };

  /**
   * @class Carver
   * @constructor
   */
  function Carver(){
    this.logger = new Logger();
  }

  /**
   * @method init
   * @param options {Object}
   *
   * Available options
   */
  Carver.init = function initCarver( options ){

    var compiler = new Carver();

    compiler.config = _.merge( {}, defaultConfig, options );

    compiler.setupWorkdir();
    
    compiler.logger.debug('carver compiler initialized at ', compiler.cwd || ' string return level');

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
  Carver.prototype.compile = function compile( content, options, cb ){

    if( typeof(options) === 'function' ){
      cb = options;
      options = {};
    }

    options = _.merge({ engine: 'plaintext', template: 'index' }, options);

    this.logger.debug('carver compiling ', ( ( content && ( content.filename || content.template || content.length+' Bytes' ) ) ||  
                                               options.template || 'workdir') + ' with options' + options );

    this.config.filenamePrefix = options.filenamePrefix;

    var compiler = this;

    if( this.cwd )
      return this.compileWorkdir( content, options, function( options ){ return compiler.compileContent( content, options, cb ); });

    var res = this.compileContent( content, options, cb );
    return res;

  };

  /**
   * @method compileContent
   * @private
   */
  Carver.prototype.compileContent = function compileContent( content, options, cb ){

    var compiler = this;

    if( content && typeof(content) === 'object' && content instanceof Array )
      return async.eachSeries( content, function( obj, nextIteration){
        var iterationCompiler = Carver.init({ workdir: compiler.cwd, 
                                              locals: compiler.config.locals,
                                              skipDependencies: compiler.config.skipDependencies });
        iterationCompiler.compile( obj, nextIteration );
      }, cb);

    if( content && typeof(content) === 'object' )
      return this.compileObject( content, options, cb );

    if( !(options.engine in Carver.engines ) )
      throw new Error('don\'t know how to compile '+options.templateFile+' (missing engine '+ options.engine+')');

    options.locals = compiler.config.locals;
    options.prettyHtml = this.config.prettyHtml;

    if( this.config.controller && typeof( this.config.controller.before ) === 'function' )
      return this.config.controller.before( content, options, function( controllerOptions ){
        return Carver.engines[options.engine].compile( content, _.merge(options, controllerOptions), continueContent );
      });
    
    return Carver.engines[options.engine].compile( content, options, continueContent );

    function continueContent(err, result){
   
      if( compiler.config.locals.doc && compiler.config.locals.doc.filenamePrefix )
        compiler.config.filenamePrefix = compiler.config.locals.doc.filenamePrefix;

      if( compiler.workdirSettings && compiler.workdirSettings.destination )
        return compiler.writeToDestination( result, options, cb );

      return typeof(cb) === 'function' ? cb(err, result) : result;

    }

  };

  /**
   * @method setupWorkdir
   * @private
   */
  Carver.prototype.setupWorkdir = function setupWorkdir(){

    if( !this.config.workdir )
      return;

    this.cwd = this.config.workdir;

    if( !fs.existsSync( this.cwd ) )
      throw new Error('carver initialized with workdir but ' + this.cwd + ' was not found');

    var settingsJS = join( this.cwd, '.settings.js' );

    if( !fs.existsSync( settingsJS ) )
      fs.writeFileSync( settingsJS, fs.readFileSync( join(__dirname, 'templates', '.settings.js')) );

    this.workdirSettings = require( settingsJS );

    if( fs.existsSync( join( this.cwd, '..', '.settings.js' ) ) )
      settingsJS = _.merge( require( join( this.cwd, '..', '.settings.js' ) ), settingsJS );

    if( fs.existsSync( join( this.cwd, '..', '..', '.settings.js' ) ) )
      settingsJS = _.merge( require( join( this.cwd, '..', '..', '.settings.js' ) ), settingsJS );

    if( settingsJS.availableLangs ){
      this.config.multiLangs = ( settingsJS.availableLangs instanceof Array ) && settingsJS.availableLangs.length > 1;
      this.config.locals.curLang = settingsJS.availableLangs[0];
    }

  };

  /**
   * @method compileWorkdir
   * @param content {String}
   * @param options {Object}
   * @private
   */
  Carver.prototype.compileWorkdir = function compileWorkdir( content, options, cb ){
    
    var compiler = this;
    var templatePath = this.cwd; //join( this.cwd, options.template );
    var templateFile;

    if( content && typeof(content) === 'object' ){
      if( content.layout )
        options.template = content.layout;
      if( content.template )
        options.template = content.template;
    }
    
    var templateFiles = fs
      .readdirSync( templatePath )
      .filter( function( file ){ 

        // check controller file (same name as template with .js extension)
        if( basename(file, extname(file)) === options.template+'.controller' && extname(file) === '.js' ){
          if( process.env.NODE_ENV === 'development' )
            delete require.cache[ join(templatePath,file) ];
          compiler.config.controller = require( join(templatePath,file) );
        }

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
   * @private
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
  Carver.prototype.compileObject = function compileObject( obj, options, cb ){

    if( !this.config.locals.doc )
      this.config.locals.doc = obj;

    if( typeof(obj.content) === 'string' )
      return this.compileContent( obj.content, _.merge( { locale: ( obj.locale || null ),
                                                          template: ( obj.template || obj.layout || null ),
                                                          filename: (obj.filename || null)}, options), cb );
   
    if(!(typeof(obj.translations) === 'object' && obj.translations instanceof Array )){
      this.logger.error('object does not provide a content nor a translations property', obj);
      return cb();
    }

    if( obj.translations.length > 0 )
      return this.compileObjectTranslations( obj, options, cb );
    this.logger.warning('translations found, but empty');
  };

  /**
   * @method compileObjectTranslations
   * @private
   */
  Carver.prototype.compileObjectTranslations = function compileObjectTranslations( obj, options, cb ){
    var compiler = this;

    // if locale is given, only compile that locale
    // and pass result back
    if( options.locale ){
      var translation = _.find( obj.translations, { locale: options.locale });
      if( !translation )
        this.logger.debug('translation ' + options.locale + ' not found for obj', obj);
      return this.compileObject( (translation ? translation : ''), options, cb );
    }

    if( this.config.defaultLocale )
      return this.compileDefaultLocaleCopy( obj, options, processEachTranslation );

    return processEachTranslation( obj, options );

    function processEachTranslation( obj, options ){
      
      // do not create .htm.<lang> files
      // if this.config.multiLangs is true (default)
      if( compiler.config.defaultLocale && !compiler.config.multiLangs )
        return cb ? cb() : null;
      
      async.eachSeries( obj.translations, function( translation, nextTranslation ){
        compiler.config.locals.doc = obj;
        compiler.config.locals.curLang = compiler.config.locals.doc.curLang = options.curLang = translation.locale;
        translation.filename = obj.filename;
        compiler.compileObject( translation, options, nextTranslation );
      }, cb);
    }

  };

  /**
   * @method compileDefaultLocaleCopy
   * @param translations {Array} array of translations
   * @param options {Object} default options passed through
   */
  Carver.prototype.compileDefaultLocaleCopy = function compileDefaultLocaleCopy( obj, options, cb ){
    var translation = _.find( obj.translations, { locale: this.config.defaultLocale });
    if( !translation )
      translation = obj.translations[0];
    translation.filename = obj.filename;
    this.compileObject( (translation ? translation : ''), _.merge({}, options, { locale: null } ) );
    return cb( obj, options );
  };

  /**
   * @method writeToDestination
   * @param htmlContent {String}
   *
   * writes to destination set up in .settings.js of workdir
   */
  Carver.prototype.writeToDestination = function writeToDestination( htmlContent, options, cb ){

    var compiler = this;
    var dst = this.workdirSettings.destination;
    var protocol = dst.indexOf('//') > 0 ? dst.split('//')[0] : 'native';

    if( !(protocol in Carver.writers) )
      throw new Error('carver compiler could not find a matching writer for '+protocol );

    options.filename = options.filename || options.template;
    if( compiler.config.filenamePrefix )
      options.filename = join( compiler.config.filenamePrefix, options.filename );

    if( compiler.config.skipDependencies.indexOf( options.filename ) >= 0 )
      return cb ? cb() : null;

    Carver.writers[protocol]( htmlContent, (options.filename || null), _.merge( {  cwd: this.cwd, 
                                                                                   locale: options.locale,
                                                                                   logger: this.logger,
                                                                                   template: options.template }, this.workdirSettings ), runAfterWriter );

    function runAfterWriter( err ){
      if( err ){ return cb ? cb( err ) : err; }
      if( compiler.config.controller && typeof(compiler.config.controller.after) === 'function' )
        return compiler.config.controller.after( options, runDependenciesAndQuit );
      runDependenciesAndQuit( null );
    }

    function runDependenciesAndQuit( err ){
      if( err ){ return cb ? cb( err ) : err; }
      if( compiler.config.controller && compiler.config.controller.dependencies && compiler.config.controller.dependencies instanceof Array ){

        compiler.config.skipDependencies.push( options.filename );

        return async.eachSeries( compiler.config.controller.dependencies, function( dep, nextIteration ){
          if( !dep.path )
            throw new Error('dependency must have a path property, had: '+dep.toString());
          compiler.logger.debug('processing dependency', dep.path);
         
          var depWorkdir = join( compiler.cwd, dep.path );
          
          if( !fs.existsSync( depWorkdir ) )
            throw new Error('dependency\'s workdir does not exist ('+depWorkdir+')');

          if( dep.options && dep.options.iterationArrayKey )
            return initIterationCompiler( compiler.config.locals[dep.options.iterationArrayKey], compiler.config.locals );

          if( dep.options && dep.options.iterationObjectKey )
            return initIterationCompiler( compiler.config.locals[dep.options.iterationObjectKey], compiler.config.locals );

          if( typeof(dep.before) === 'function' )
            return dep.before( compiler.config.locals, initIterationCompiler );

          if( typeof(dep.options.inheritKeys) === 'object' ){
            compiler.config.locals.inherited = {};
            for( var key in dep.options.inheritKeys )
              compiler.config.locals.inherited[key] = compiler.config.locals[dep.options.inheritKeys[key]];
          }

          initIterationCompiler( null, compiler.config.locals );

          function initIterationCompiler( iterationObj, iterationLocals ){
            var iterationCompiler = Carver.init({ workdir: depWorkdir, 
                                                  locals: iterationLocals,
                                                  skipDependencies: compiler.config.skipDependencies});
            iterationCompiler.compile( iterationObj, nextIteration  );
          }

        }, cb);
      }
      if( cb )
        cb( null );
    }

  };


  /**
   * @method registerEngine
   * @param names {String|Array} array can be used, to make engine available under different file extensions
   *
   * register a new compiler engine
   *
   */
  Carver.registerEngine = function registerEngine( names, engine ){
    Carver.engines = Carver.engines || {};
    
    if( typeof(names) === 'string' )
      names = [ names ];

    names.forEach(function(name){
      Carver.engines[name] = engine;
    });

  };

  /**
   * @method registerWriter
   * @param names {String|Array} should match a protocol (e.g.: ftp, smb, ...)
   */
  Carver.registerWriter = function registerWriter( names, writer ){
  
    Carver.writers = Carver.writers || {};
    
    if( typeof(names) === 'string' )
      names = [ names ];

    names.forEach(function(name){
      Carver.writers[name] = writer;
    });

  };

  Carver.registerEngine( ['markdown','md'], require(__dirname+'/engines/markdown' ) );
  Carver.registerEngine( ['plaintext', 'text'], require(__dirname+'/engines/plaintext' ) );
  Carver.registerEngine( 'jade', require(__dirname+'/engines/jade' ) );

  Carver.registerWriter( ['file', 'native'], require( __dirname+'/writers/file' ) );

  return Carver;

};
