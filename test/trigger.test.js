require('./helper').init( function( helper ){

  'use strict';
  var expect          = helper.chai.expect;
  var carver          = require(__dirname+'/../index');
  var Carver          = require(__dirname+'/../lib/carver');
  var errors          = require(__dirname+'/../lib/errors');
  var RSVP            = require('rsvp');
  var jade            = require('jade');
  var MissingCwdError = require('../lib/errors').MissingCwdError;

  var wd6Path = helper.getSupportDir('wd6');
  helper.setupTemplateDir( 'index', wd6Path );

  describe( '#triggers', function(){

    it('chainable');

    it('registers trigger to ._triggers property');

    it('must be a function');

  });

  describe( '#trigger', function(){
    
    it('triggers all set up triggers as a promise chain reaction');

  });

});
