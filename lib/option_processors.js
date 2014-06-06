(function(){

  'use strict';

  var fs                  = require('fs');
  var join                = require('path').join;
  var dirname             = require('path').dirname;
  var _                   = require('lodash');
  var mkdirp              = require('mkdirp');
  var FileNotFoundError   = require('./errors').FileNotFoundError;
  var InvalidDocumentError  = require('./errors').InvalidDocumentError;

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

  /**
   * refer to a document (e.g. database object).
   * These are used as an input for render.
   *
   * document should have the ``carver.options.contentKey``
   * in order to make them be parsed
   *
   * document can have the ``carver.options.manyKey``
   * in order to make that array parsed recursively expecting
   * the ``carver.options.contentKey`` option in turn again
   *
   * @method optionProcessor.doc
   * @param {Object} doc
   * @param {Carver}  compiler the instantiated carver object
   * @private
   */
  module.exports.doc = function( doc, compiler ){
    if( typeof( doc ) !== 'object' )
      throw new InvalidDocumentError('document passed to document is not an objct');

    if( !(compiler.options.manyKey in doc) && !(compiler.options.contentKey in doc) && !(doc instanceof Array) )
      throw new InvalidDocumentError('object not recognized. neither by options.contentKey:'+
                                    compiler.options.contentKey+' nor by options.manyKey:'+
                                    compiler.options.manyKey+' nor is it an array');
    compiler.options.doc = compiler.options.locals.doc = doc;

    if( compiler.options.doc[compiler.options.filenameKey] )
      compiler.options.filename = compiler.options.filename || compiler.options.doc[compiler.options.filenameKey];

  };

})();
