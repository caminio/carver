# sitter

sitter is a static html page generator. It has a modularized core where all kinds of compilers
can be added.

## Installation

    npm install sitter

## Overview

    var Sitter = require('sitter');
    var compiler = Sitter.init({ workdir: '/my/workdir' });

    // define templates with your favorite template engine
    // like .jade, .swig, .ejs, .handlebars, ...
    // fetch webpages or whatever from your database

    webpages.forEach(function(webpage){
      compiler.compile( webpage );
    });

## Introduction

The most common use of sitter is through a workdir. The **workdir** defines the root of your static
content. But not necessarily the root of your web site. A typical sitter structure looks like this:

    workdir
      /public                 // your public directory declared in your web server's config
      /templates              // name this whatever you want. But ``templates`` suits nice. This
                              // path needs to be declared as an option to the Sitter compile method

### initializing Sitter

    var Sitter = require('sitter');
    var compiler = Sitter.init({ workdir: '/my/work/dir/templates' });

Now you can compile all different kinds of objects or strings. "Objects", you may ask? Yes. For more see
 the next heading. First we just compile some simple text.

    compiler.compile( '# Heading\nNormal Text', { engine: 'markdown' } );

This returns the html result of the markdown compiler. We are using [marked](https://github.com/chjj/marked),
which we found is a very robust and flexible compiler with github pages support. But that's actually not what
we're after. We want it to be stored in a file:

    compiler.compile();

This will run through the workdir checking for a template called ``index`` (or if you passed in a ``template`` option
for the name given) and search for a valid engine extension:

    workdir
      /templates
        /index.jade

Perfect match! Jade support is built-in. Of course, you can snap in any engine you want. It's really simple. See below
for more details. If nothing else was passed into the compile method, that'll do it. An index.htm file will be generated
to the specified ``destination`` folder (defined in workdir/.settings.js).

### compiling objects

The fun begins with objects. Let's asume, you have objects like this:

    mywebpage = { (...any attributes...), content: '#my content in markdown' };

Now, just pass this object into the compiler:

    compiler.compile( webpage );

This will pass a ``content`` attribute to the locals object before compiling the template of your workdir.
It will have the same effect as if you would do:

    compiler.compile( null, { locals: { content: compiler.compile(webpage.content) } } );

#### templates

But you would want to define different kinds of layouts / templates for your webpage. For example, the index,
default, a gallery, the blog and so on.

    compiler.compile( webpage, { template: 'default' });

This looks up a template in your workdir named 'default/' and requires an engin - valid file with the same name
inside. Here: 'default.jade'. Oh, and, of course, you can have your webpage store that template as well.

If the given object has a ``template`` property, that will used instead.

#### filename

As we don't want our webpages to override each other, we want to specify a name for the location.

    compiler.compile( webpage, { filename: 'myfile' })

And this of course would be unneccessary type stuff. Of course, as with the template, the filename property of
the webpage will be taken into account instead. So basically, if you have an object containing

* content
* filename
* layout or template

You don't need to pass any options along with the compile method.

#### hirarchy

It doesn't occur seldomly, that webpages are nested. This nesting needs to be mirrored somehow in the final
structure of the static website.

Apparently that's a database task. But, if you add a ``ancestors`` - array to your webpage, sitter will try to read in
their ``filename`` attributes sticking them all together to build a full path to your webpage.

### i18n - multi language support

If you webpage or whatever object has a ``translations`` array with the following structure, it will be parsed and a
.html.[lang] file will be created for each translation.

* content
* locale

### Options for ``.settings.js``

#### destination

##### relative path

    '../public/my/path'

A path relative to the workdir

##### file:///

    'file:///srv/my/path'

An absolute path somewhere in the filesystem. Non existent directories will be created


##### ftp://

    'ftp://<user>:<pass>@<host>'

This feature is not implemented yet

## Extending sitter

### engine

An engine just needs to export a ``.compile`` method. The plaintext compiler as a skeleton
looks like this:

    module.exports.compile = function( content, options, callback ){
      
      if( typeof(callback) === 'function' )
        return callback( null, content );

      return content;

    }

    Sitter.registerEngine( 'text', require('content-above-in-a-file') );

### writer

A writer is responsible for writing the resulting content somehwere. The only native writer is
the file writer (currently).


    module.exports = function fileWriter( content, filename, options, callback ){

      // do something in here

      callback();

    }


