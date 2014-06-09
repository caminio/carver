module.exports = function Engines( Carver ){

  'use strict';

  var _               = require('lodash');
  
  /**
   * @method registerEngine
   * @param {String|Array} names array can be used, to make engine available under different file extensions
   *
   * register a new compiler engine
   *
   */
  Carver.registerEngine = function registerEngine( names, engine ){
    
    if( typeof(names) === 'string' )
      names = [ names ];

    _.each( names, function(name){
      this.engines[name] = engine;
    }, this );

  };

  /**
   * @method registerEngine
   * @param {String|Array} names (see constructor for documentation)
   */
  Carver.prototype.registerEngine = function registerEngine( names, engine ){
    this.constructor.registerEngine( names, engine );
    return this;
  };

  /**
   * @method useEngine
   * @param {String} name the name of the engine to use. Must have been registered before
   */
  Carver.prototype.useEngine = function useEngine( name ){
    if( !(name in this.constructor.engines) )
      throw new Error('engine '+name+' is not registered');
    this._useEngine = this.constructor.engines[name];
    return this;
  };

  /**
   * clears all engines. this can be usefull to verify which engines are used
   *
   * @method clearEngines
   * 
   */
  Carver.clearEngines = function clearEngines(){
    this.engines = {};
  };

  Carver.prototype.clearEngines = function(){
    this.constructor.clearEngines();
    return this;
  };

};
