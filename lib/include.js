module.exports = function includes( Carver ){

  'use strict';

  var _               = require('lodash');
  var join            = require('path').join;
  
  /**
   *
   * include the built-in file writer
   *
   * @method includeMarkdownEngine
   *
   */
  Carver.includeMarkdownEngine = function(){
    this.registerEngine(['md','markdown'], require( join(__dirname,'engines','markdown') ) );
  };

  Carver.prototype.includeMarkdownEngine = function(){
    this.constructor.includeMarkdownEngine();
    return this;
  };
  
  /**
   *
   * include the built-in file writer
   *
   * @method includeFileWriter
   *
   */
  Carver.includeFileWriter = function(){

    this.registerWriter(['file'], require( join(__dirname,'writers','file') ) );

  };

  Carver.prototype.includeFileWriter = function(){
    this.constructor.includeFileWriter();
    return this;
  };

};
