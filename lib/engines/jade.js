module.exports.compile = function compileJade( content, options, cb ){

  'use strict';
  
  var jade = require('jade');

  var result = jade.renderFile( options.templateFile, options.locals );
  
  return cb( null, result );


};
