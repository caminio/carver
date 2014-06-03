require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  var errors  = require(__dirname+'/../lib/errors');

  var wd1Path = helper.getSupportDir('wd1');

  describe( '#includeMarkdownEngine', function(){

    it('includes the default markdown engine', function(){
      var compiler = carver().includeMarkdownEngine();
      expect( Carver.engines ).to.have.property('markdown');
      expect( Carver.engines ).to.have.property('md');
    });

  });

  describe( '#includeFileWriter', function(){

    it('includes the default file writer', function(){
      var compiler = carver().includeFileWriter();
      expect( Carver.writers ).to.have.property('file');
    });

  });

});
