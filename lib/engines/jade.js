module.exports.compile = function compileJade( content, options, cb ){

  'use strict';

  var _       = require('lodash');
  var jade    = require('jade');

  var result = jade.renderFile( options.templateFile, _.merge({}, options.locals, { pretty: options.prettyHtml }) );
  
  return cb( null, result );


};
