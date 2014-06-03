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
   */
  module.exports.cwd = function( cwd, compiler ){
    if( !fs.existsSync(cwd) )
      throw new FileNotFoundError(cwd);
    compiler.cwdSettings = processSettingsFile( cwd );
  };

  function processSettingsFile( cwd ){
    var settingsPath = join(cwd,'.settings.js');
    if( !fs.existsSync( settingsPath ) );
      fs.writeFileSync( settingsPath, fs.readFileSync( join(__dirname,'templates','.settings.js') ) );
    return require( settingsPath );
  }

})();
