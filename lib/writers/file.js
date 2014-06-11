module.exports.write = function fileWriter( filename, content, compiler, resolve ){

  'use strict';

  var join    = require('path').join;
  var mkdirp  = require('mkdirp');
  var fs      = require('fs');
  var dirname = require('path').dirname;

  if( filename.indexOf('../') === 0 )
    filename = join( compiler.options.cwd, filename );

  mkdirp.sync( dirname(filename) );

  if( fs.existsSync(filename) && fs.statSync( filename ).isDirectory() )
    filename = filename + '/index';

  filename += compiler.options.fileExtension;

  if( compiler.options.lang && compiler.options.langExtension )
    filename += '.' + compiler.options.lang;

  fs.writeFileSync( filename, content );

  var stats = fs.statSync( filename );

  // console.log('written', stats.size, 'Bytes to', filename);
  compiler.logger.debug('written', stats.size, 'Bytes to', filename);

  resolve(content);

};
