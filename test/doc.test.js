require('./helper').init( function( helper ){

  'use strict';
  var expect  = helper.chai.expect;
  var join    = require('path').join;
  var fs      = require('fs');
  var _       = require('lodash');
  var carver  = require(__dirname+'/../index');
  var Carver  = require(__dirname+'/../lib/carver');

  var wd6Path = helper.getSupportDir('wd6');
  helper.setupTemplateDir( 'index', wd6Path );

  describe('#doc', function(){
  
    it('chainable', function(){
      expect( carver().set('doc', helper.fixtures.simpleWebpage ) ).to.be.instanceOf(Carver);
    });

    it('object with content', function(){
      expect( carver().set('doc', helper.fixtures.simpleWebpage ).options.doc ).to.eql( helper.fixtures.simpleWebpage );
    });

    it('object with manyKey', function(){
      expect( carver().set('doc', helper.fixtures.trWebpage ).options.doc ).to.eql( helper.fixtures.trWebpage );
    });

    it('array', function(){
      var arr = [ helper.fixtures.simpleWebpage, helper.fixtures.simpleWebpage ];
      expect( carver().set('doc', arr ).options.doc ).to.eql( arr );
    });

    it('gets sticked to locals', function(){
      expect( carver().get('locals') ).to.not.have.property('doc');
      expect( carver().set('doc', helper.fixtures.simpleWebpage ).get('locals') ).to.have.property('doc');
    });

    it('renders object\'s content (raw)', function(){
      return carver().set('doc', helper.fixtures.simpleWebpage ).render().should.eventually.eql('# heading');
    });

    it('renders object\'s content (markdown)', function(){
      return carver().set('doc', helper.fixtures.simpleWebpage ).includeMarkdownEngine().render().should.eventually.eql('<h1 id=\"heading\">heading</h1>\n');
    });

    describe('translations (hasMany)', function(){

      it('default @options.lang=en', function(){
        return carver()
                 .set('doc', helper.fixtures.trWebpage )
                 .includeMarkdownEngine()
                 .render()
                 .should.eventually.eql('<h1 id=\"english\">english</h1>\n');
      });

      it('@options.lang=de', function(){
        return carver()
                 .set('lang','de')
                 .set('doc', helper.fixtures.trWebpage )
                 .includeMarkdownEngine()
                 .render()
                 .should.eventually.eql('<h1 id=\"deutsch\">deutsch</h1>\n');
      });

    });

    describe('writing simple files', function(){
      
      describe('recognizes doc filename and', function(){

        before(function(done){
          carver()
            .registerEngine('jade', require('jade'))
            .includeFileWriter()
            .set('doc', helper.fixtures.simpleWebpage )
            .set( 'cwd', wd6Path )
            .set( 'langExtension', false )
            .write()
            .then(function(){
              done();
            })
            .catch(function(err){
              console.log('err',err);
            });
        });

        it('writes out to <destinations@each>/<filename>.htm', function(){
          expect( join(wd6Path,'..','public/simple_webpage.htm') ).to.be.a.file();
        });

      });

    });

    describe('writing translation files', function(){
      
      describe('recognizes doc translations and', function(){

        before(function(done){
          carver()
            .registerEngine('jade', require('jade'))
            .includeFileWriter()
            .set('doc', helper.fixtures.trWebpage )
            .set( 'cwd', wd6Path )
            .write()
            .then(function(){
              done();
            })
            .catch(function(err){
              console.log('err',err);
            });
        });

        it('writes out 2 translation files', function(){
          expect( join(wd6Path,'..','public/tr_webpage.htm.en') ).to.be.a.file();
          expect( join(wd6Path,'..','public/tr_webpage.htm.de') ).to.be.a.file();
        });

      });

    });

    describe('drafts', function(){ 

      var wd61Path = helper.getSupportDir('wd61');
      helper.setupTemplateDir( 'index', wd61Path );

      describe('simple webpage (no translations)', function(){

        before(function(done){
          var test = this;
          carver()
            .registerEngine('jade', require('jade'))
            .includeFileWriter()
            .set('cwd',wd61Path)
            .set('doc', helper.fixtures.simpleWebpage )
            .write()
            .then( function(){
              done();
            })
          .catch( function(err){
            test.error = err;
            done();
          });
        });

        it('writes to DRAFT folder', function(){
          expect( join(wd61Path,'..','public/drafts/'+helper.fixtures.simpleWebpage._id+'.htm') ).to.be.a.file();
        });

      });

      describe('translations', function(){

        before(function(done){
          var test = this;
          carver()
            .registerEngine('jade', require('jade'))
            .includeFileWriter()
            .set('cwd',wd61Path)
            .set('doc', helper.fixtures.trWebpage )
            .write()
            .then( function(){
              done();
            })
          .catch( function(err){
            test.error = err;
            done();
          });
        });

        it('writes to DRAFT folder', function(){
          expect( join(wd61Path,'..','public/drafts/'+helper.fixtures.trWebpage._id+'.htm.en') ).to.be.a.file();
          expect( join(wd61Path,'..','public/drafts/'+helper.fixtures.trWebpage._id+'.htm.de') ).to.be.a.file();
        });
      
      });

    });

    describe('publishing', function(){ 

      var wd62Path;

      before(function(){
        wd62Path = helper.getSupportDir('wd62');
        helper.setupTemplateDir( 'index', wd62Path );
      });

      describe('draft', function(){

        before(function(done){
          var test = this;
          carver()
            .registerEngine('jade', require('jade'))
            .includeFileWriter()
            .set('cwd', wd62Path)
            .set('publishingStatusKey','status')
            .set('doc', _.merge({}, helper.fixtures.simpleWebpage) )
            .registerHook('before.write', function(content,compiler,resolve){ compiler.options.doc.status = 'draft'; resolve(content); })
            .write()
            .then( function(){
              done();
            })
          .catch( function(err){
            test.error = err;
            done();
          });
        });

        it('draft file exists', function(){
          expect( join(wd62Path,'..','public/drafts/'+helper.fixtures.simpleWebpage._id+'.htm') ).to.be.a.file();
        });

        it('public files do not exist', function(){
          expect( fs.existsSync(join(wd62Path,'..','public/'+helper.fixtures.simpleWebpage.filename+'.htm')) ).to.eql(false);
        });

      });

      describe('publish', function(){

        before(function(done){
          var test = this;
          carver()
            .registerEngine('jade', require('jade'))
            .includeFileWriter()
            .set('cwd', wd62Path)
            .set('doc', _.merge({}, helper.fixtures.simpleWebpage) )
            .write()
            .then( function(){
              done();
            })
          .catch( function(err){
            test.error = err;
            done();
          });
        });

        it('draft file exists', function(){
          expect( join(wd62Path,'..','public/drafts/'+helper.fixtures.simpleWebpage._id+'.htm') ).to.be.a.file();
        });

        it('public files exists', function(){
          expect( join(wd62Path,'..','public/'+helper.fixtures.simpleWebpage.filename+'.htm') ).to.be.a.file();
        });

      });

    });

  });

});
