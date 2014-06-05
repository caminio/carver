(function(){

  'use strict';

  var fs                = require('fs');
  var join              = require('path').join;
  var dirname           = require('path').dirname;
  var _                 = require('lodash');
  var mkdirp            = require('mkdirp');
  var FileNotFoundError = require('./errors').FileNotFoundError;

  /**
   *
   * sets up cwd if not exists and reads
   * in .config/env.js. If .config/env.js was not found
   * it will be created with default settings
   *
   * @method OptionProcessor.cwd
   * @param {String} cwd the current working directory for the parser
   * @param {Carver} compiler the instantiated carver object
   * @private
   *
   */
  module.exports.cwd = function( cwd, compiler ){

    if( !fs.existsSync(cwd) )
      throw new FileNotFoundError(cwd);

    var configPath = join(cwd,'config/env.js');

    mkdirp.sync( dirname(configPath) );

    if( !fs.existsSync( configPath ) );
      fs.writeFileSync( configPath, fs.readFileSync( join(__dirname,'templates','/env.js') ) );

    if( compiler.options.destination )
      compiler.logger.warn('options.destination has been set already but might be overridden by config/env.js');

    _.merge( compiler.options, require( configPath ) );

  };

  /**
   * sets up the template
   *
   * does not allow to set template without workdir to be set
   *
   * @method optionProcessor.template
   * @param {String} template the template to be used
   * @param {Carver}  compiler the instantiated carver object
   * @private
   *
   */
  module.exports.template = function( template, compiler ){
    
    if( !compiler.options.cwd )
      throw new Error('no cwd is set. Please set(\'cwd\',\'/path/to/working/directory/with/templates/\') first');


  };


})();
