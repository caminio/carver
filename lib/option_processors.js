(function(){

  'use strict';

  var fs                = require('fs');
  var join              = require('path').join;
  var FileNotFoundError = require('./errors').FileNotFoundError;

  /**
   *
   * sets up cwd if not exists and reads
   * in .settings.js. If .settings.js was not found
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

    var settingsPath = join(cwd,'.settings.js');

    if( !fs.existsSync( settingsPath ) );
      fs.writeFileSync( settingsPath, fs.readFileSync( join(__dirname,'templates','.settings.js') ) );

    compiler.parseCwd( settingsPath );

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
