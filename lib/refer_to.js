module.exports = function refer( Carver ){

  'use strict';

  var _                   = require('lodash');
  var join                = require('path').join;
  var Promise             = require('promise');
  var InvalidObjectError  = require('./errors').InvalidObjectError;

  /**
   * refer to an object or array of objects.
   * These are used as an input for render.
   *
   * objects should have the ``carver.options.contentKey``
   * in order to make them be parsed
   *
   * objects can have the ``carver.options.manyKey``
   * in order to make that array parsed recursively expecting
   * the ``carver.options.contentKey`` option in turn again
   *
   * @method referTo
   * @param {Object} obj an object or array
   * @return {Carver}
   */
  Carver.prototype.referTo = function referTo( obj ){
    if( typeof( obj ) !== 'object' )
      throw new InvalidObjectError('object passed to referTo is not an object');

    if( !(this.options.manyKey in obj) && !(this.options.contentKey in obj) && !(obj instanceof Array) )
      throw new InvalidObjectError('object not recognized. neither by options.contentKey:'+
                                    this.options.contentKey+' nor by options.manyKey:'+
                                    this.options.manyKey+' nor is it an array');
    this._obj = obj;

    //if( obj instanceof Array )
    //  _.each( obj, this.referTo( obj ) );

    //if( this.options.manyKey in obj )
    //  _.each( obj[this.options.manyKey], function( manyValue ){
    //    compiler.referTo( _.merge( _.omit(obj,compiler.options.manyKey), _.omit(manyValue, compiler.options.primaryKey)) );
    //  });

    return this;
  };

};
