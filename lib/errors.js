( function(){

  'use strict';

  module.exports.CarverOptionError = function CarverOptionError( message ){
    this.name = 'CarverOptionError';
    this.message = 'option error: ' + message;
  };

  module.exports.FileNotFoundError = function FileNotFoundError( message ){
    this.name = 'FileNotFoundError';
    this.message = 'File or Directory ' + message + ' does not exist';
  };

  module.exports.InvalidObjectError = function InvalidObjectError( message ){
    this.name = 'InvalidObjectError';
    this.message = message;
  };

  module.exports.UnknownHookError = function UnknownHookError( name, knownHooks ){
    this.name = 'UnknownHookError';
    this.message = 'the hook name '+name+' is not known. Valid hook names are: '+knownHooks.join(',');
  };

})();
