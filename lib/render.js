module.exports = function render( Carver ){

  'use strict';

  var _               = require('lodash');
  var RSVP            = require('rsvp');
  var join            = require('path').join;

  /**
   *
   * include the built-in file writer
   *
   * @method render
   * @param {String|Object|Array} content the content to compile
   * @param {String} lang a language to use for doc (if present)
   * @return {Promise}
   *
   */
  Carver.prototype.render = function render( content, lang ){

    var compiler = this;
    this.setupRenderPreconditions();
    content = content || this.setupContentIfNone();
    compiler.options.locals.curLang = lang;
    if( compiler.options.doc || compiler.options.cwd ){
      compiler.options.locals.docname = compiler.options.doc ? compiler.options.doc.filename : (compiler.options.template || compiler.options.filename);
      compiler.options.locals.urlNoLang = join('/',(compiler.options.doc && compiler.options.doc.url ? compiler.options.doc.url : compiler.options.locals.docname));
      compiler.options.locals.url = lang ? join('/',lang,compiler.options.locals.urlNoLang) : compiler.options.locals.urlNoLang;
    }

    var promiseChain = new RSVP.Promise( function(resolve){ resolve(content); } );
    promiseChain = promiseChain.then( attachPreprocessors );
    promiseChain = promiseChain.then( doRender );
    promiseChain = promiseChain.then( attachPostprocessors );

    return promiseChain;
                       
    function attachPreprocessors(content){
      return compiler.createHookChain('before.render', content);
    }

    function attachPostprocessors(content){
      return compiler.createHookChain('after.render', content);
    }

    function doRender(content){

      return new RSVP.Promise( function(resolve, reject){
        // if no engines are set up, just return the content
        // as it is
        if( _.keys(compiler.constructor.engines).length < 1 )
          return resolve( content );

        if( compiler.options.doc && lang )
          compiler.options.doc.curLang = lang;

        // if no cwd has been set up, and only one engine is
        // present or an engine has been defined, run and return
        try{
          if( typeof(compiler._useEngine) === 'object' )
            return resolve( compiler._useEngine.render( content, compiler.collectCompileOptions() ) );
        }catch(e){ Carver.logger.error('render error', e.stack); return reject(e); }

        compiler.logger.warn('no engine found for content. returning as plaintext');
        resolve( content );
      });

    }

  };

  /**
   * setup some basic conditions in order
   * to simplify initialization of render
   *
   * @method setupRenderPreconditions
   * @private
   */
  Carver.prototype.setupRenderPreconditions = function setupRenderPreconditions(){
    if( _.keys(this.constructor.engines).length === 1 )
      this._useEngine = this.constructor.engines[_.first(_.keys(this.constructor.engines))];
  };

  /**
   *
   * setup default lang if no content
   *
   * @method setupContentIfNone
   * @return {String}
   * @private
   */
  Carver.prototype.setupContentIfNone = function setupRenderPreconditions(){

    if( !this.options.doc ){
      this.logger.warn('neither a content nor a document object has been set up. You seem to render an empty string');
      return '';
    }

    if(!_.isEmpty(this.options.doc[this.options.contentKey]) )
      return this.options.doc[this.options.contentKey];

    var content;

    if( this.options.doc[this.options.manyKey] && this.options.doc[this.options.manyKey].length > 0 ){
      var opts = {};
      opts[this.options.langKey] = this.options.lang;
      var translation = _.find(this.options.doc[this.options.manyKey], opts);
      if( translation && translation[this.options.contentKey] )
        content = translation[this.options.contentKey];
    }

    return content;

  };

  /**
   * collect compile options
   *
   * @method collectCompileOptions
   * @private
   */
  Carver.prototype.collectCompileOptions = function collectCompileOptions(){
    var opts = _.merge({}, this.options.locals );
    if( this.options.template && this.options.cwd )
      opts.filename = join( this.options.cwd, this.options.template+'.jade' );
    opts.compileDebug = this.options.debug;
    opts.pretty = this.options.prettyHtml;
    return opts;
  };

};
