module.exports = function refer( Carver ){

  'use strict';

  var _                   = require('lodash');
  var UnknownHookError    = require('./errors').UnknownHookError;
  var RSVP                = require('rsvp');

  /**
   * @method knownHooks
   * @return hooksArray of strings with known hooks
   */
  Carver.knownHooks = function(){
    return [ 'before.render', 'before.write', 'after.render', 'after.write' ];
  };

  /**
   * registers a hook
   *
   * @method registerHook
   * @param {String} name the name of the hook
   * @param {String} name.before.render run before the actual render process
   * @param {String} name.after.render run before the actual render process
   * @param {String} name.before.write run before the actual write process
   * @param {String} name.after.write run before the actual write process
   * @param {Boolean} inherit inherit this hook in case of dependencies being processed (default: true)
   *
   * @param {Fuction} callback the callback function for the new hook
   * 
   * @example
   *
   *     carver()
   *       .registerHook('before.render', prepareLocals);
   *
   *     function prepareLocals( compiler, next ){
   *       compiler.locals.myVar = 1;
   *     }
   */
  Carver.prototype.registerHook = function registerHook( name, callback, inherit ){

    inherit = typeof(inherit) === 'undefined' ? true : inherit; 
    if( !inherit )
      callback.skipOnInheritance = true;

    if( !_.contains( Carver.knownHooks(), name ) )
      throw new UnknownHookError( name, Carver.knownHooks() );

    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push( callback );

    return this;

  };

  /**
   * @method createHookChain
   * @param {String} hookName
   * @param {String} option the option passed to the chain
   * @private
   */
  Carver.prototype.createHookChain = function createHookChain(hookName, option){
  
    var compiler = this;

    var hookChain = new RSVP.Promise(function(resolve){ resolve(option); });

    if( !(hookName in compiler._hooks ) )
      return hookChain;

    _.each( compiler._hooks[hookName], function(hook){
      hookChain = hookChain.then( function( option ){
        return new RSVP.Promise( function(resolve,reject){
          try{
            hook( option, compiler, resolve );
          } catch(err){
            Carver.logger.error('error in ', hookName, err);
            reject(err);
          }
        });
      });
    });


    return hookChain;

  };

};
