module.exports.compile = function compileMarkdown( content, options, cb ){
  'use strict';

  var marked = require('marked');
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true
  });

  return cb( null, marked(content) );

};
