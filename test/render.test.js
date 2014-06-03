require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  var errors  = require(__dirname+'/../lib/errors');

  var wd2Path = helper.getSupportDir('wd2');

  describe( '#useEngine', function(){
    
    it('uses the given engine, in case of ambiguous engine setup', function(){ 
      expect( carver().includeMarkdownEngine()._useEngine ).to.be.a('undefined');
      expect( carver().includeMarkdownEngine().useEngine('markdown')._useEngine ).to.be.a('object');
    });

  });


  describe( '#render', function(){

    it('plaintext content', function( done ){
      carver()
        .render('plaintext')
        .then(function( result ){
          expect( result ).to.eql('plaintext');
          done();
        });
    });

    it('markdown content', function( done ){
      carver()
        .includeMarkdownEngine()
        .useEngine('markdown')
        .render('plaintext')
        .then(function( result ){
          expect( result ).to.eql('<p>plaintext</p>\n');
          done();
        });
    });

    it('jade content', function( done ){
      carver()
        .clearEngines()
        .registerEngine('jade', require('jade'))
        .render('p plaintext')
        .then(function( result ){
          expect( result ).to.eql('\n<p>plaintext</p>');
          done();
        });
    });

  });

});
