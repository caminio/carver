module.exports.init = function( cb ){

  'use strict';
  
  var fs = require('fs');
  var mkdirp = require('mkdirp');
  var join = require('path').join;

  process.env.NODE_ENV = 'test';

  var helper = {};
  helper.chai = require('chai');
  helper.Compiler = require(__dirname+'/../index');
  helper.chai.config.includeStack = true;

  helper.fixtures = {};
  helper.fixtures = require(__dirname+'/fixtures');

  helper.getSupportDir = function getSupportDir( path ){
    path = join( __dirname, 'support', path );
    if( !fs.existsSync( path ) )
      mkdirp.sync( path );
    return path;
  };

  helper.setupTemplateDir = function setupTemplateDir( template, path ){
    path = helper.getSupportDir( path );
    deleteDirRecursive( path );
    mkdirp.sync( path );
    fs.writeFileSync( join( path, 'README.txt'), 'THIS FILE SHOULD NOT AFFECT rocksol compiler in any way');
    fs.writeFileSync( join( path, template+'.js'), 'module.exports = function(){ return {}; };');
    fs.writeFileSync( join( path, template+'controller.js'), 'module.exports.before = function( locals, cb ){ cb(); };');
    fs.writeFileSync( join( path, template+'.jade'), 'h1 Heading');
  };

  helper.cleanupPublicDir = function setupTemplateDir(){
    var path = helper.getSupportDir( '' );
    deleteDirRecursive( path );
  };

  cb( helper );

  function deleteDirRecursive(path) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file){
        var curPath = path + '/' + file;
        if(fs.lstatSync(curPath).isDirectory())
          deleteDirRecursive(curPath);
        else
          fs.unlinkSync(curPath);
      });
      fs.rmdirSync(path);
    }
  }

};
