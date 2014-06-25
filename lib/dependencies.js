module.exports = function includes( Carver ){

  'use strict';

  var _               = require('lodash');
  var RSVP            = require('rsvp');

  /**
   * sets dependencies to be executed after this
   * carver instance is finished
   *
   * @method dependencies
   * @param {Object} options options to be passed to the new carver instance
   * 
   * @example
   *
   *     ...
   *     .dependencies({ cwd: '/other/workdir' })
   *
   * would run a new carver instance (with all settings from current carver instance
   * apart those that are explicitely defined in the options object
   *
   *     ...
   *     .dependencies({ docArrayKey: 'children' })
   *
   * would look for a ``children`` key in the current options.doc object. If found, it
   * iterates over that key instantiating a new carver with inherited settings from parent
   * for each child
   *
   */
  Carver.prototype.dependencies = function dependencies(){
    var compiler = this;
    compiler.options.dependencies = compiler.options.dependencies || [];
    Array.prototype.slice.call( arguments ).forEach(function(dep){
      compiler.options.dependencies.push(dep);
    });
    return this;
  };

  /**
   * run all dependencies
   *
   * @method runDependencies
   * @return {Promise}
   * @private
   */
  Carver.prototype.runDependencies = function runDependencies(){
    var compiler = this;
    var promise = new RSVP.Promise( function(resolve){ resolve(); });
    if( !this.options.dependencies )
      return promise;
    this.options.dependencies.forEach(function(dep){
      // if( !compiler.isLooping(dep) )
      if( dep.doc && dep.doc[compiler.options.primaryKey] ){
        if( _.find(compiler._ranDependencies, dep.doc[compiler.options.primaryKey] ) )
          return;
        compiler._ranDependencies.push(dep.doc[compiler.options.primaryKey]);
      } else {
        if( _.find(compiler._ranDependencies, dep) )
          return;
        compiler._ranDependencies.push(dep);
      }
      promise = promise.then( function(){ return compiler.runDependency(dep); } );
    });
    compiler.options.dependencies = [];
    return promise;
  };

  /**
   * checks if the given dependency is looping
   * compares id with db of ids
   *
   * @method isLooping
   * @param {Object} dep the dependency optionset to check
   * @return {Boolean}
   * @private
   */
  Carver.prototype.isLooping = function isLooping(dep){
    if( dep.doc && dep.doc[compiler.options.primaryKey] ){
      if( _.find(compiler._ranDependencies, dep.doc[compiler.options.primaryKey] ) )
        return true;
      compiler._ranDependencies.push(dep.doc[compiler.options.primaryKey]);
    } else {
      if( _.find(compiler._ranDependencies, dep) )
        return true;
      compiler._ranDependencies.push(dep);
    }
    return false;
  };

  /**
   * run given dependency and instaniate 
   * a new carver
   *
   * @method runDependency
   * @return {Promise}
   * @private
   */
  Carver.prototype.runDependency = function runDependency( dependencyOptions ){

    var compiler    = this;
    var childCarver = this.clone({hooks: true});
    var promise     = new RSVP.Promise( function(resolve){ resolve(); });

    for( var key in dependencyOptions )
      if( key === 'doc' && typeof(dependencyOptions.doc) === 'function' )
        promise = runDocFn();
      else
        childCarver.set(key, dependencyOptions[key]);

    promise = promise.then( function(){
      return childCarver.write(); 
    });

    promise.catch(function(err){
      Carver.logger.error('error when loading doc in dependencies', err);
    });

    return promise;

    function runDocFn(){
      return new RSVP.Promise( function( resolve, reject ){
        dependencyOptions.doc( childCarver, resolve, reject );
      });
    }
  };

};
