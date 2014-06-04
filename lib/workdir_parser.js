module.exports = function refer( Carver ){

  'use strict';

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
