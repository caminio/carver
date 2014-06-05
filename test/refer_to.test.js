require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');
  var errors  = require(__dirname+'/../lib/errors');

  describe('#referTo', function(){
  
    it('chainable', function(){
      expect( carver().referTo( helper.fixtures.simpleWebpage ) ).to.be.instanceOf(Carver);
    });

    it('object with content', function(){
      expect( carver().referTo( helper.fixtures.simpleWebpage )._obj ).to.eql( helper.fixtures.simpleWebpage );
    });

    it('object with manyKey', function(){
      expect( carver().referTo( helper.fixtures.trWebpage )._obj ).to.eql( helper.fixtures.trWebpage );
    });

    it('array', function(){
      var arr = [ helper.fixtures.simpleWebpage, helper.fixtures.simpleWebpage ];
      expect( carver().referTo( arr )._obj ).to.eql( arr );
    });

    it('gets sticked to locals', function(){
      expect( carver().get('locals') ).to.not.have.property('doc');
      expect( carver().referTo( helper.fixtures.simpleWebpage ).get('locals') ).to.have.property('doc');
    });

  });

});
