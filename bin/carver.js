#!/usr/bin/env node

var program     = require('commander');
var pkg         = require('../package');
var fs          = require('fs');
var join        = require('path').join;
var dirname     = require('path').dirname;
var mkdirp      = require('mkdirp');
var colors      = require('colors');

var cwd = './';

program
  .version(pkg.version);

program
  .option('new <name>', 'Create a new carver project directory' )
  .option('--plain', 'skip creation of index')
  .on( 'new', newProject );

program.parse(process.argv);

function newProject( name ){
  console.log('');
  if( fs.existsSync( join( cwd, name ) ) )
    return console.error( '    ','aborted'.red, 'reason:', name.bold+' already exists\n' );

  createDirectory(name);
  copyFile( join(__dirname,'..','lib','templates','env.js'), name+'/config/env.js' );

  console.log('\ncarver project has been created successfully.\nYou might want to start with setting up the \nconfig/env.js file\n\n');
}

function createDirectory( name ){
  console.log('    ','ok'.green, name.bold);
  mkdirp.sync( join( cwd, name ) );
}

function copyFile( source, dest ){
  mkdirp.sync( dirname( dest ) );
  fs.writeFileSync( join(cwd,dest), fs.readFileSync(source) );
  console.log('    ','ok'.green, dest.bold);
}
