module.exports = function includes( Carver ){

  'use strict';

  var _               = require('lodash');
  var join            = require('path').join;

  /**
   * include all available built-in tools
   * this is:
   * * markdown
   * * jade
   * * file writer
   *
   * @method includeAll
   */
  Carver.prototype.includeAll = function(){
    this.constructor.includeMarkdownEngine();
    this.constructor.includeFileWriter();
    return this;
  };
  
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
    this._useEngine = this.engines.md;
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

    this.registerWriter(['file','cwd'], require( join(__dirname,'writers','file') ) );

  };

  Carver.prototype.includeFileWriter = function(){
    this.constructor.includeFileWriter();
    return this;
  };

};
