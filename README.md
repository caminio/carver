[![Build Status](https://travis-ci.org/caminio/carver.png)](https://travis-ci.org/caminio/sitter)

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

carver is chainable. You just add settings and methods one after other (as demonstrated in the example above).

carver provides 2 different mechanism of rendering:

* low-level with ``.render('any string')`` returning the rendered string
* high-level through ``.write()`` which requires a ``set('cwd','/path/to/my/cwd')`` to be set and makes use of templates and settings found there. Read more about the workdir (cwd) in the [section below](#workdir)

## Engines

An engine is responsible for compiling the given content into whatever (usually html). By default, no engine is
available and carver would just pass back the same content as entered.

### Register an engine

    carver()
      .registerEngine('ejs', require('ejs'));

As you can see, you simple require the official ``ejs`` module and it's native ``.render`` method will work. You can
do this with any module supporting that express like behavior.

## Writers

A writer is - compared to an engine - a little bit more work of customization.
1. It will only be applied if a cwd has been set (it will read it's config/env.js file and use it as it's working directory)
2. It is registered with a protocol name, so in the config/env.js a 'destination' property can be set telling carver where to store the file

If the config/env.js looks like this:

    ...
    destination: 'file:///my/path/to/public'
    ...

carver looks up in it's writers registry for a ``file`` handler and triggers that one when ``write()`` is called.


### Register a writer

    carver()
      .registerWriter('webdav', myWebdavWriter);

Luckily, carver provides the most common writer, the filesystem writer. Enable it with:

    carver()
      .includeFileWriter();


###<a name='hooks'></a> Hooks

Hooks plug in at different stages of the compile process, execute a code and resolve to the next hook.
Currently the following hooks are available in the following order

* before.render
* after.render
* before.write (only in case of cwd)
* after.write

Example:

    carver()
      .registerHook('before.render', function( compiler, resolve){ 
        // do something and e.g.: 
        compiler.options.locals.myVar = 123;
        resolve();
      });


##<a name="workdir"></a> Working with cwd (working directories)

The default use-case probably is, that you will work with objects somehow created (db?), passed on to carver along with a 
working directory and letting carver do the rest:

* resolve the cwd and process it's file system structure
  * load all <template>.hooks.js and <template>.<engine>
  * register their hooks
* check the passed in object for translations (manyKey) and recursively instantiate a compiler for each translation

So basically, the workdir can be understood as a mini-(M)VC framework structure, whereas the model comes from some different
source.

### controllers (.hooks.js)

A controller (hook) file can be plugged in at different stages of the rendering process. See the [hooks](#hooks) section above
for available hooks.

A typical .hooks.js file looks like this:

    module.exports = {

      'before.render': function( content, compiler, resolve ){
        content = content.toLowerCase();
        resolve(content);
      }
      
    };

A hook function is internally wrapped with an RSVP promise. That's why we call the callback ``resolve``. Whereas we are treating
these files as hooks, that are just manipulating the content, it is also possible, to create the actual content in a hook. Carver
accepts ``.render()`` without an argument - as well as ``.writer()``.

#### ``.setup``

    module.exports.setup = function( compiler ){
      // do some stuff with compiler, e.g. if different situations for different template files
      // termine them and:
      compiler.registerEngine('html', myPureHTMLEngine);
      compiler.useEngine('html');
    }

Just be aware, there is no promise awareness within the setup yet.

### config/env.js

Every workdir should contain a configuration file called ``env.js`` within a ``config`` directory. This is done automatically
by the [carver commandlin helper](#commandlinehelper).

## Working with objects

Also a common use-case is to not pass the text content but objects with fields containing these contents. That simplifies
the syntax, as you might want the object to be available for further processing within carver.

### set('doc')

  With ``.set('doc', obj )``, 

##<a name='commandlinehelper'></a> carver commandline helper

To simplify the process of creating a workdir, carver comes with a commandline tool that can do this job for you.

    carver new <workdir-name>

sets up a basic configuration containing the ``config/env.js`` and an example index.jade and index.hooks.js file. If you prefer a
plain directory, use the ``--plain`` flag.

## internationalization

Causing carver to create a structure like:

    <filename>.htm.en
    <filename>.htm.de

If your object has, let's say a ``translations`` array housing objects which look similar to the root object but store translated
versions of the original object (we only use translations in [caminio](http://caminio.github.com), even if there is no need for translations).

If translations are found, the render/write process is triggered for each translation file, with the ``@options.lang`` flag set according
to the current translation. The actual content would be the same, if you don't traverse internally to the right translation. This can be 
done with a ``before.render``-hook and reading out the ``compiler.options.lang`` property, which is available for pre/postprocessor hooks.

## publishing mechanism

carver comes with a simple publishing mechanism. Every written content will be written to the ``drafts``-directory (defined in the 
config/env.js or directly through set('drafts', ...)).

Now, if you are using a publish-status key, let's say in your documents's ``status`` property, carver recognizes the flag as documented below:

### ``published``

carver renders everything set up. This includes ``drafts`` plus all ``destinations``.

### ``draft``

carver only runs the drafts section, skipping the rest.

## dependencies

If you compile a webpage, it happens quite regularily, that the webpage is refered to from another webpage. E.g. if the title of the webpage
changes, it is neccessary to re-render all the webpages who refer to the current webpage. Also, thinking of any kind of navigation. carver
doesn't help you with finding those dependencies, but it lets you define an array of dependending objects along with a workdir (cwd) option.

    carver()
      .set('doc', obj )
      .dependencies({ doc: obj1, cwd: '/path/to/workdir/of/obj1' });

Basically, this options are the same options, you can set with the ``.set()`` method. All other settings will be inherited from the current
carver instance settings to a new carver instance, which in turn can have dependencies again, if defined in the workdir's dependencies property.

If used in the workdir, it might be useful to be able to add a doc object by a promise:

    ...
    dependencies: [
      { 
        doc: function( compiler, resolve, reject ){ 
                compiler.set('doc', getMyDoc());
                resolve();
              });
      }
    ]

## config/env.js

There is no global settings file carver is interested in. It always just looks out for the ``config/env.js`` within the current
working directory. This is very important to note.

### destinations

An array of strings defining destinations to write to with the writer.

Example:

    destinations: [ 'file:///absolute/path/to/my/public' ]

This would write the resulted file (name is taken either from the @options.filename, doc[@options.filenameKey] or @options.template) to the absolute directory on the filesystem. A writer needs to have been registered before initiating the ``.write`` method (e.g.: ``includeFileWriter()``).

The protocol part is taken to look up for the writer. Here, a writer with the name ``file`` needs to be registered. It is also possible to register your own writers copying content to ftp, ssh or something similar. The writer just gets ``content``, the content, ``filename`` the destination part (sliced from the protocol part), ``compiler``, the current carver instance and ``resolve``, the promise resolver.

### dependencies

An array of option objects containing information for any dependencies to be run after this workdir render/write process has finished.

Example:

    dependencies: [ { cwd: '/other/cwd/path', docArrayKey: 'siblings' } ]

sepcial options are:

* ``docArrayKey`` - iterates over the array instantiating a new carver for each document. The ``docArrayKey`` has to be present in the ``@options.locals`` object.
* ``docKey`` - calls a new carver instance with the ``docKey`` (must be present in ``@options.locals``).

### drafts

A string (in the same format of ``destinations``) where draft pages should be stored. This only takes effect, if the option ``publishingStatusKey`` is set (default: 'status'). Read more about it in the [publishing mechanisms](#publishing) section.
