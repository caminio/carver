( function(){

  'use strict';

  /**
   * The directory to look up layouts, .settings.js
   * and controllers
   *
   * @property options.cwd
   * @type String
   * @default null
   */
  module.exports.cwd = null;

  /**
   * @property options.destination 
   * @type String
   * @default null
   */
  module.exports.destination = null;

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
   * only precedence when using ``referTo``
   * If this key is present, the given object in referTo
   * will be parsed for it's manyKey object (must be an array)
   * and it's contentKey will be used instead
   *
   * @property options.manyKey
   * @type String
   * @default 'translations'
   */
  module.exports.manyKey = 'translations';

  /**
   * only precedence when using ``referTo``
   * This key is where the actual string content is
   * looked up in the object
   *
   * @property options.contentKey
   * @type String
   * @default 'content'
   */
  module.exports.contentKey = 'content';

  /**
   * only precedence when using ``referTo``
   * This is the key used to identify the object
   * uniquely
   *
   * @property options.primaryKey
   * @type String
   * @default '_id'
   */
  module.exports.primaryKey = '_id';

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

})();
