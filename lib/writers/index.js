module.exports = function Writers( Carver ){

  'use strict';

  var _               = require('lodash');
  
  /**
   * @method registerWriter
   * @param {String|Array} names array can be used, to make writer available under different file extensions
   *
   * register a new compiler writer
   *
   */
  Carver.registerWriter = function registerWriter( names, writer ){
    
    if( typeof(names) === 'string' )
      names = [ names ];

    _.each( names, function(name){
      this.writers[name] = writer;
    }, this );

  };

  Carver.prototype.registerWriter = function registerWriter( names, writer ){
    this.constructor.registerWriter( names, writer );
    return this;
  };

};
