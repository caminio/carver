module.exports = function fileWriter( content, filename, options, cb ){

  'use strict';

  var join    = require('path').join;
  var mkdirp  = require('mkdirp');
  var fs      = require('fs');

  var dest = join( options.cwd, options.destination );
  if( options.destination.indexOf('file:///') === 0 )
    dest = options.destination.replace('file://','');

  if( !fs.existsSync( dest ) )
    mkdirp.sync( dest );

  if( !filename )
    filename = options.template;
  filename = filename + '.htm';

  dest = join( dest, filename );

  if( options.locale )
    dest += '.' + options.locale;

  fs.writeFileSync( dest, content );

  var stats = fs.statSync( dest );

  options.logger.debug('written ', stats.size, ' Bytes to ', dest);

  if( typeof(cb) === 'function' )
    cb( null );

};
