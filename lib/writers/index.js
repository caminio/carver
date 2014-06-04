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

  /**
   * write output to given filename
   *
   * @method write
   * @param {String} [filename] optional filename (if no filename is given and .referTo has been initialized, carver will try to read filename from the obj)
   * 
   * @example
   *
   *     carver()
   *       ...
   *       .write( '/path/to/file' )
   *       .then( function(){
   *         // .. finish your processing
   *       });
   *
   *
   *     carver()
   *       ...
   *       .write()
   *       .then( function(){ // continue your processing });
   *
   */
  Carver.prototype.write = function write( filename ){
    if( typeof(filename) === 'string' )
      this.options.filename = filename;
  };

};
