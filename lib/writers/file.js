module.exports.write = function fileWriter( filename, compiler, resolve ){

  'use strict';

  var join    = require('path').join;
  var mkdirp  = require('mkdirp');
  var fs      = require('fs');
  var dirname = require('path').dirname;

  if( filename.indexOf('../') === 0 )
    filename = join( compiler.options.cwd, filename );

  mkdirp.sync( dirname(filename) );

  filename += compiler.options.fileExtension;

  if( compiler.options.curLang )
    filename += '.' + compiler.options.curLang;

  fs.writeFileSync( filename, compiler.content );

  var stats = fs.statSync( filename );

  compiler.logger.debug('written', stats.size, 'Bytes to', filename);

  resolve();

};
