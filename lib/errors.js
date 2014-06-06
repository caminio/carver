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

  module.exports.InvalidDocumentError = function InvalidDocumentError( message ){
    this.name = 'InvalidDocumentError';
    this.message = message;
  };

  module.exports.UnknownHookError = function UnknownHookError( name, knownHooks ){
    this.name = 'UnknownHookError';
    this.message = 'the hook name '+name+' is not known. Valid hook names are: '+knownHooks.join(',');
  };

  module.exports.TemplateNotFoundError = function TemplateNotFoundError( name, template ){
    this.name = 'TemplateNotFoundError';
    this.message = 'the cwd path name '+name+' does not contain a '+template+ '.<engine> template';
  };

  module.exports.UnknownEngineError = function UnknownEngineError( name ){
    this.name = 'UnknownEngineError';
    this.message = 'the template\'s engine is unknown: '+name;
  };

  module.exports.MissingEngineError = function MissingEngineError(){
    this.name = 'MissingEngineError';
    this.message = 'no engine has been configured. Use carver.registerEngine(<extNameOfYourTemplate>)';
  };

  module.exports.MissingCwdError = function MissingEngineError(){
    this.name = 'MissingCwdError';
    this.message = 'missing cwd (working directory). Did you miss carver().set(\'cwd\', \'/path/to/work/dir\')?';
  };

  module.exports.MissingDestinationError = function MissingDestinationError(){
    this.name = 'MissingDestinationError';
    this.message = 'missing a destination. Should have been set up with .to("<handler>://<path>") or as "destination"-property within config/env.js in workdir';
  };

  module.exports.UnknownWriterError = function UnknownWriterError(protocol){
    this.name = 'UnknownWriterError';
    this.message = 'No writer could be associated with the passed in protocol ('+protocol+')';
  };

  module.exports.MissingWriterError = function MissingWriterError(){
    this.name = 'MissingWriterError';
    this.message = 'No writer has been registered. Did you forget to use registerWriter or includeFileWriter()?';
  };


})();
