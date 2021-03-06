( function(){

  'use strict';

  var _                 = require('lodash');
  var CarverOptionError = require('./errors').CarverOptionError;
  var OptionProcessors  = require('./option_processors');

  Carver.logger         = require('./logger');

  /**
   * @class Carver
   * @constructor
   */
  function Carver(){
    this.options = _.merge({}, require('./defaults'));
    this.logger = Carver.logger;
    this._hooks = {};
    this._ranDependencies = [];
    this.options.dependencies = this.options.dependencies || [];
    this.constructor.engines = this.constructor.engines || {};
    this.constructor.writers = this.constructor.writers || {};
    this.engines = this.constructor.engines;
    this.writers = this.constructor.writers;
  }

  // extend Carver.prototype
  require('./engines')( Carver );
  require('./writers')( Carver );
  require('./include')( Carver );
  require('./render')( Carver );
  require('./dependencies')( Carver );
  require('./workdir_parser')( Carver );
  require('./hooks')( Carver );

  /**
   *
   * Changes keys in the options object. You can either pass
   * in an object containing the keys to change or specify
   * a key-value pair.
   *
   * set is chainable
   *
   * @method set
   * @param {String} key an option key to set
   * @param {String|Object} value an option for this carver instance
   * @return {Carver} carver the current instance of carver
   *
   * @example
   *     carver()
   *       .set('key', 'value');
   *
   *     carver()
   *       .set({ key: value, key2: value2 })
   *
   */
  Carver.prototype.set = function setOption( key, value ){
    if( typeof(key) === 'string' )
      this.options[key] = value;
    else if( typeof(key) === 'object' )
      _.merge(this.options, key);
    else
      throw new CarverOptionError('cannot interpret given option', key, value);
    this.postProcessOption( key, this );
    return this;
  };

  /**
   * Reads back an option set in carver
   *
   * @method get
   * @return {String|Object} the value set in the given key or null if nothing
   *
   * @example
   *     carver()
   *       .get('destination');
   */
  Carver.prototype.get = function getOption( key ){
    if( key in this.options )
      return this.options[key];
  };

  /**
   * post-processes options
   * @method postProcessOption
   * @private
   */
  Carver.prototype.postProcessOption = function postProcessOption( key ){
    if( typeof( key ) === 'object' )
      return _.each( _.keys( key ), this.postProcessOption, this );
    if( key in OptionProcessors )
      return OptionProcessors[key]( this.options[key], this );
  };

  /**
   * starts processing options, e.g. the cwd is parsed
   * for hooks and layout files
   *
   * @method initialize
   * @return {Carver} this
   * @private
   */
  Carver.prototype.initialize = function initialize(){
    this.parseCwd();
    return this;
  };

  /**
   * clones a current instance with all the locals but
   * doc object specific settings
   *
   * @method clone
   * @param {Object} options a set of options
   * @param {Boolean} options.hooks inherit hooks (default: false)
   * @return {Carver} a new carver instance
   */
  Carver.prototype.clone = function clone( options ){
    options = options || {};
    options.hooks = options.hooks || false;

    var newCarver = new Carver();
    newCarver
      .set('locals', _.omit(this.options.locals, ['doc','markdownContent','markdownAside']));
   
    for( var key in this.options )
      if( !key.match(/filename|template|locals|doc|dependencies/) )
        newCarver.set(key,this.options[key]); 

    newCarver._ranDependencies = _.merge([],this._ranDependencies);

    if( options.hooks )
      _.each( this._hooks, function(hooks,hookName){
        hooks.forEach(function(hook){
          if( !hook.skipOnInheritance )
            newCarver.registerHook( hookName, hook );
        });
      });

    newCarver.options.dependencies = [];
    return newCarver;
  };

  module.exports = Carver;

})();
