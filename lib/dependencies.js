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
    this._dependencies = this._dependencies || [];
    Array.prototype.slice.call( arguments ).forEach(function( dep ){
      if( !_.find( compiler._dependencies, dep ) )
        compiler._dependencies.push( dep );
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
    return RSVP.all( (this._dependencies || []).map( function(dep){ return compiler.runDependency(dep); }) );
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
    var childCarver = new this.constructor()
        .set( _.merge({}, this.options ) )
        .set( dependencyOptions );
    
    // TODO: these two lines shouldn't be neccessary, but options override each other
    // in a wrong way currently, so this needs to be in here for now
    if( dependencyOptions.destinations )
      childCarver.set('destinations', dependencyOptions.destinations);
    childCarver.write();
    return childCarver;
  };

};