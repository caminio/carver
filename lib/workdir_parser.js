module.exports = function refer( Carver ){

  'use strict';

  var _                   = require('lodash');
  var join                = require('path').join;
  var Promise             = require('promise');
  var InvalidObjectError  = require('./errors').InvalidObjectError;

  /**
   * Parses the cwd for controller and adds it to the
   * middleware process flow
   *
   * @method parseCwd
   * @param {String} settingsPath the path to the settings filename
   * @private
   */
  Carver.prototype.parseCwd = function parseCwd( settingsPath ){

    this.cwdSettings = require( settingsPath );

  };

};
