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
  helper.fixtures.webpage = require(__dirname+'/fixtures/webpage');
  helper.fixtures.webpageWithTranslations = require(__dirname+'/fixtures/webpage_with_translations');
  helper.fixtures.webpageWithOneTranslation = require(__dirname+'/fixtures/webpage_with_one_translation');
  helper.fixtures.webpageWithFilename = require(__dirname+'/fixtures/webpage_with_filename');
  helper.fixtures.webpageWithTemplate = require(__dirname+'/fixtures/webpage_with_template');

  helper.getSupportDir = function getSupportDir( path ){
    return join( __dirname, 'support', path );
  };

  helper.setupTemplateDir = function setupTemplateDir( template, path ){
    path = helper.getSupportDir( path );
    deleteDirRecursive( path );
    mkdirp.sync( path );
    mkdirp.sync( join( path, template ) );
    fs.writeFileSync( join( path, template, 'README.txt'), 'THIS FILE SHOULD NOT AFFECT rocksol compiler in any way');
    fs.writeFileSync( join( path, template, template+'.js'), 'module.exports = function(){ return {}; };');
    fs.writeFileSync( join( path, template, template+'.jade'), 'h1 Heading');
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
