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


  // if( compiler._ranDependencies.indexOf( filename ) >= 0 ){
  //   compiler._skipDependencies = true;
  //   return resolve(content);
  // }

  fs.writeFileSync( filename, content );

  if( compiler.options.copyFilenames && compiler.options.copyFilenames instanceof Array )
    compiler.options.copyFilenames.forEach(function(copyFilename){
      fs.writeFileSync( copyFilename+'.'+compiler.options.fileExtension+(compiler.options.lang && compiler.options.langExtension ? '.'+compiler.options.lang : ''));
    });

  var stats = fs.statSync( filename );

  // console.log('written', stats.size, 'Bytes to', filename);
  compiler.logger.debug('written', stats.size, 'Bytes to', filename);

  compiler.finalFilename = filename;
  compiler._ranDependencies.push( filename );

  resolve(content);

};
