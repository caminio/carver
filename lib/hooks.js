module.exports = function refer( Carver ){

  'use strict';

  var _                   = require('lodash');
  var join                = require('path').join;
  var Promise             = require('promise');
  var UnknownHookError    = require('./errors').UnknownHookError;
  var RSVP                = require('rsvp');

  /**
   * @method knownHooks
   * @return hooksArray of strings with known hooks
   */
  Carver.knownHooks = function(){
    return [ 'beforeRender', 'beforeWrite' ];
  };

  /**
   * registers a hook
   *
   * @method registerHook
   * @param {String} name the name of the hook
   * @param {String} name.beforeRender run before the actual render process
   * @param {String} name.beforeWrite run before the actual write process
   *
   * @param {Fuction} callback the callback function for the new hook
   * 
   * @example
   *
   *     carver()
   *       .registerHook('beforeRender', prepareLocals);
   *
   *     function prepareLocals( compiler, next ){
   *       compiler.locals.myVar = 1;
   *     }
   */
  Carver.prototype.registerHook = function registerHook( name, callback ){

    if( !_.contains( Carver.knownHooks(), name ) )
      throw new UnknownHookError( name, Carver.knownHooks() );

    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push( callback );

    return this;

  };

  /**
   * @method createHookChain
   * @param {String} hookName
   * @private
   */
  Carver.prototype.createHookChain = function createHookChain(hookName){
  
    var compiler = this;

    var chain = new RSVP.Promise(function(resolve){ resolve(compiler.content); });

    if( this._hooks[hookName] )
      _.each( this._hooks[hookName], function(hook){
        chain.then( function(){ return new RSVP.Promise( function( resolve ){ return hook( compiler, resolve ); } ); });
      });

    return chain;

  };

};
