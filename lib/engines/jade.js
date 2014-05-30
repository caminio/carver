module.exports.compile = function compileJade( content, options, cb ){

  'use strict';
  
  var jade = require('jade');

  var result = jade.renderFile( options.templateFile, { globals: (options.globals || {}) } );
  
  return cb( null, result );


};
