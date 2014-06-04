[![Build Status](https://travis-ci.org/caminio/sitter.png)](https://travis-ci.org/caminio/sitter)

# Features

carver is a static site generator with loads of features.

We know, there are loads of static site generators out there in the node world. But for our 
use case we needed something highly modularizable and adaptable. this static site generator
can:

* render plain content files with additional use of middleware processors (such as our pebbles concept)
* render (db-)objects with a customizable property (here: 'content')
* render (db-)objects iterating through an array of objects containing the content attribute (here: 'translations')
* plug in any engine that returns something (jade, swig, ejs, you name em)
* plug in any writer defining the destination where the result should go to (works without writer as callback result)
* ... many more

    var carver = require('carver');
    carver()
      .includeMarkdown()
      .set('cwd', '/path/to/layouts')
      .render( wegpage )
      .then( function( html ){
        // do something with the html
      });

# Installation

    npm install carver

# Introduction

carver is chainable. you just add settings and methods one after other (as demonstrated in the example above).

## Engines

An engine is responsible for compiling the given content into whatever (usually html). By default, no engine is
available and carver would just pass back the same content as entered.

### Register an engine

    carver()
      .registerEngine('ejs', require('ejs'));

As you can see, you simple require the official ``ejs`` module and it's native ``.render`` method will work. You can
do this with any module supporting that express like behavior.

## Writers

A writer is - compared to an engine - a little bit more work of customization. Read more about it in the section below.

### Register a writer

    carver()
      .registerWriter('webdav', myWebdavWriter);

Luckily, carver provides the most common writer, the filesystem writer. Enable it with:

    carver()
      .includeFileWriter();


### Hooks

Hooks plug in at different stages of the compile process, execute a code and resolve to the next hook.
Currently the following hooks are available:

* beforeRender
* before_write

    carver()
      .registerHook('beforeRender', function( content, compiler, resolve){ 
        // do something and e.g.: 
        compiler.options.locals.myVar = 123;
        resolve();
      });


## Working with cwd (working directories)

The default use-case probably is, that you will work with objects somehow created (db?), passed on to carver along with a 
working directory and letting carver do the rest:

* resolve the cwd and process it's file system structure
  * load all <template>.hooks.js and <template>.<engine>
  * register their hooks
* check the passed in object for translations (manyKey) and recursively instantiate a compiler for each translation

### a .hooks.js file

A typical .hooks.js file looks like this:

    module.exports.beforeRender = function( content, compiler, resolve ){
      content = content.toLowerCase();
    }
