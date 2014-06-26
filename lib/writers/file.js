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

  if( compiler.options.copyFilenames && compiler.options.copyFilenames instanceof Array )
    compiler.options.copyFilenames.forEach(function(copyFilename){
      copyFilename = join( dirname(filename), copyFilename );
      copyFilename = copyFilename+compiler.options.fileExtension+(compiler.options.lang && compiler.options.langExtension ? '.'+compiler.options.lang : '');
      fs.writeFileSync( copyFilename, fs.readFileSync( filename ) );
      compiler.logger.debug('copied', stats.size, 'Bytes to', copyFilename);
    });

  // console.log('written', stats.size, 'Bytes to', filename);
  compiler.logger.debug('written', stats.size, 'Bytes to', filename);

  compiler.finalFilename = filename;
  compiler._ranDependencies.push( filename );

  resolve(content);

};
