( function(){

  'use strict';

  var UnreadableOptionError = require('./errors').UnreadableOptionError;

  /**
   * @class Carver
   * @constructor
   */
  module.exports = function Carver(){
    this.options = require('./defaults');
  };

  /**
   *
   * Changes keys in the options object. You can either pass
   * in an object containing the keys to change or specify
   * a key-value pair.
   *
   * @method set
   * @param {String} key an option key to set
   * @param {String|Object} value an option for this carver instance
   * @return {Carver} carver the current instance of carver
   *
   * @example
   *     carver()
   *       .set('key', 'value');
   *
   *     carver()
   *       .set({ key: value, key2: value2 })
   *
   */
  Carver.prototype.set = function setOption( key, value ){
    if( typeof(key) === 'string' && typeof(value) !== 'undefined' )
      this.options[key] = value;
    if( typeof(key) === 'object' )
      _.merge(this.options, key);
    else
      throw new UnreadableOptionError('cannot interpret given option');
  };

  /**
   * Reads back an option set in carver
   *
   * @method get
   * @return {String|Object} the value set in the given key or null if nothing
   *
   * @example
   *     carver()
   *       .get('destination');
   */
  Carver.prototype.get = function getOption( key ){
    if( key in this.options )
      return this.options[key];
  };

})();
