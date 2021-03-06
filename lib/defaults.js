( function(){

  'use strict';

  /**
   * The directory to look up layouts, config/env.js
   * and controllers
   *
   * @property options.cwd
   * @type String
   * @default null
   */
  module.exports.cwd = null;

  /**
   * @property options.locals
   * @type Object
   * @default {}
   */
  module.exports.locals = {};

  /**
   * @property options.debug
   * @type Boolean
   * @default false
   */
  module.exports.debug = false;

  /**
   * @property options.filename
   * @type String
   * @default null
   */
  module.exports.filename = null;

  /**
   * @property options.prettyHtml
   * @type Boolean
   * @default true
   */
  module.exports.prettyHtml = true;

  /**
   * only precedence when using ``doc``
   * If this key is present, the given object in doc
   * will be parsed for it's manyKey object (must be an array)
   * and it's contentKey will be used instead
   *
   * @property options.manyKey
   * @type String
   * @default 'translations'
   */
  module.exports.manyKey = 'translations';

  /**
   * only precedence when using ``doc``
   * This key is where the actual string content is
   * looked up in the object
   *
   * @property options.contentKey
   * @type String
   * @default 'content'
   */
  module.exports.contentKey = 'content';

  /**
   * only precedence when using ``doc``
   * This is the key used to identify the object
   * uniquely
   *
   * @property options.primaryKey
   * @type String
   * @default '_id'
   */
  module.exports.primaryKey = '_id';

  /**
   * only precedence when using ``doc``
   * defines the key which stores the language
   * of the manyKey object
   *
   * @property options.langKey
   * @type String
   * @default 'locale'
   */
  module.exports.langKey = 'locale';

  /**
   * define languages to be rendered if no
   * doc with translations is given. This 
   * can be usefull for index files which
   * you want to be processed with multiple
   * translation settings
   * @property options.renderLangs
   * @type Array
   * @default []
   */
  module.exports.renderLangs = [];

  /**
   * only precedence when using ``doc``
   * defines the key for the filename
   * of the object
   *
   * @property options.filenameKey
   * @type String
   * @default 'filename'
   */
  module.exports.filenameKey = 'filename';

  /**
   * only precedence when using ``doc``
   * holds the current language
   *
   * @property options.lang
   * @type String
   * @default 'en'
   */
  module.exports.lang = 'en';

  /**
   * only precedence when using ``doc``
   * defines if the filename should have a
   * language extension, e.g.: .en In combination
   * with the fileExtension this defaults to: .htm.en
   *
   * This option has no effect, if @options.lang is null
   *
   * @property options.langExtension
   * @type Boolean
   * @default true
   */
  module.exports.langExtension = true;

  /**
   * only precedence when using ``doc``
   *
   * tells carver to create a plain copy without
   * a language extension.
   *
   * This does e.g. when having [en,de]:
   * .htm.en, .htm.de, .htm
   *
   * @property options.langlessCopy
   * @type Boolean
   * @default false
   */
  module.exports.langlessCopy = false;

  /**
   * the template key in the doc object (if present)
   * @property options.templateKey
   * @type String
   * @default 'layout'
   */
  module.exports.templateKey = 'layout';

  /**
   * The template to be used, when rendering from
   * a cwd (working directory). If cwd is not set,
   * this option has no effect
   *
   * @property options.template
   * @type String
   * @default 'index'
   */
  module.exports.template = 'index';

  /**
   * @property options.fileExtension
   * @type String
   * @default '.htm'
   */
  module.exports.fileExtension = '.htm';

  /**
   * Enables publishing feature. This includes
   * a ``revisions`` folder where documents are copied to and kept with their
   * revisions
   *
   * To make this work, a document must have
   * * options.primaryKey (default: _id)
   * * options.statusKey (default: status) whereas status is a string with 'published', 'draft', 'revoked'
   * * * published: the default behavior. A document is copied to the destination folder(s)
   * * * draft: the document will be written to the revisions folder, but not to the destinations folder
   * * * revoked: the destination folders will be checked for existing filenames matching this document and eventually removed
   *
   * @property options.publishingStatusKey
   * @type String
   * @default null
   */
  module.exports.publishingStatusKey = null;

  /**
   * place a copy of the current render result in another file
   *
   * @property options.copyFilenames
   * @type Array
   * @default undefined
   */
  module.exports.copyFilenames = undefined;

  /**
   * skip any dependency either inherited by cloning
   * or set up in config/env.js
   * @property options.skipDependencies
   * @type Boolean
   * @default false
   */
  module.exports.skipDependencies = false;

})();
