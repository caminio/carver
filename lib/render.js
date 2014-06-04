module.exports = function render( Carver ){

  'use strict';

  var _               = require('lodash');
  var join            = require('path').join;
  var RSVP            = require('rsvp');

  /**
   *
   * include the built-in file writer
   *
   * @method render
   * @param {String|Object|Array} content the content to compile
   * @return {Promise}
   *
   */
  Carver.prototype.render = function render( content, options  ){
    var compiler = this;
    compiler.content = content;
    this.setupRenderPreconditions();
    var chain = this.createHookChain('beforeRender');

    var deferred = RSVP.defer();
    chain.then( doRender );

    return deferred.promise;
                       
    function doRender(){

      // if no engines are set up, just return the content
      // as it is
      if( _.keys(compiler.constructor.engines).length < 1 )
        return deferred.resolve( compiler.content );

      // if no cwd has been set up, and only one engine is
      // present or an engine has been defined, run and return
      if( !compiler.options.cwd && typeof(compiler._useEngine) === 'object' )
        return deferred.resolve( compiler._useEngine.render( compiler.content, compiler.collectCompileOptions() ) );

      throw new Error('no engines set up');

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
   * collect compile options
   *
   * @method collectCompileOptions
   * @private
   */
  Carver.prototype.collectCompileOptions = function collectCompileOptions(){
    var opts = _.merge( _.pick( this.options, ['filename'] ), this.options.locals );
    opts.compileDebug = this.options.debug;
    opts.pretty = this.options.prettyHtml;
    return opts;
  };

};
