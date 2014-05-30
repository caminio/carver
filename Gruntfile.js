module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
        options: {
          globals: ['should'],
          timeout: 4000,
          bail: true,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'spec'
        },
        src: ['test/**/*.test.js']
      }
    }, 

    dox: {
      options: {
          title: 'sitter documentation'
        },
      files: {
          src: ['lib'],
          dest: 'docs'
        }
    },

    clean: [ 'test.log' ]

  });

  grunt.loadNpmTasks('grunt-dox');

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('docs', function(){
    grunt.task.run('dox');
  });

  grunt.registerTask('test', 'runs all tests', function(){
    grunt.task.run('clean');
    grunt.config('mochaTest.test.src', ['test/**/*.test.js']);
    grunt.task.run('mochaTest');
  });

  
  grunt.loadNpmTasks('grunt-contrib-clean');


  // Default task(s).
  grunt.registerTask('default', ['test']);

};
