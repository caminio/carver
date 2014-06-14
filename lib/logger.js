/*
 * carver
 *
 * @author quaqua <quaqua@tastenwerk.com>
 * @date 05/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */
(function(){

  'use strict';

  var winston       = require('winston');
  var  dirname       = require('path').dirname;
  var  fs            = require('fs');
  var  mkdirp        = require('mkdirp');
  var  util          = require('util');

  /**
   * create a new logger instance
   */
  function Logger( options ){

    this.levels = {
      silent: 4,
      error: 3,
      warn: 2,
      info: 1,
      debug: 0
    };

    options = options || {};
    options.env = options.env || process.env.NODE_ENV || 'development';
    options.config = options.config || {};
    options.config.loglevel = options.config.loglevel || this.levels.debug;
    options.config.logfile = options.config.logfile || process.cwd()+'/carver.log';

    var config = {};
    config.colorize = config.colorize || true;

    config.level = config.level || this.levels.debug;

    this.logger = new winston.Logger();

    this.warn = log('warn');
    this.error = log('error');
    this.debug = log('debug');
    this.info = log('info');

    if( options.env === 'development' )
      this.logger.add(
        winston.transports.Console, { 
          level: options.config.loglevel || 'debug', 
          colorize: true
        });
    else{
      if( !fs.existsSync(dirname(options.config.logfile)) )
        mkdirp(dirname(options.config.logfile));
      this.logger.add(
        winston.transports.File, { 
          level: options.config.loglevel || 'info', 
          colorize: false,
          filename: options.config.logfile
        });
    }

    var self = this;

    /**
     * wrapper for the winston log method
     * determines the level and concatenates arguments
     * @api private
     */
    function log( level ){
      return function() {
        var str = [];
        for( var i in arguments ){
          var arg = arguments[i];
          if (typeof arg === 'object') {
            if (arg instanceof Error)
              str.push(arg.stack);
            else
              str.push(util.inspect(arg));
          } else if( typeof(arg) === 'function' )
            str.push(arg.valueOf());
          else
            str.push(arg);
        }
        if ( self.levels[level] >= config.level ) {
          self.logger.log(level, str.join(' '));
        }
      };
    }
    
  }

  module.exports = new Logger();

})();
