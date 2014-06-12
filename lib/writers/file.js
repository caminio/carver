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


  if( compiler._ranDependencies.indexOf( filename ) >= 0 ){
    compiler._skipDependencies = true;
    return resolve(content);
  }

  fs.writeFileSync( filename, content );

  var stats = fs.statSync( filename );

  // console.log('written', stats.size, 'Bytes to', filename);
  compiler.logger.debug('written', stats.size, 'Bytes to', filename);

  compiler._ranDependencies.push( filename );

  resolve(content);

};
