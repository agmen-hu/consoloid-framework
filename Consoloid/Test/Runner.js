var glob = require('glob');
var Mocha = require('mocha');
require('./Environment');

defineNamespace('Consoloid.Test');

global.Consoloid.Test.Runner = $.inherit(
  {
    __constructor: function(options)
    {
      $.extend(this, {
        directory: '.',
        mochaOptions: {
          ui: 'bdd',
          reporter: 'list'
        }
      }, options);

    },

    setOptions: function(options)
    {
        $.extend(this.mochaOptions, options);
        return this;
    },

    run: function(pattern)
    {
      pattern = pattern || '/';

      var grepPattern = this.mochaOptions.grep ? new RegExp(this.mochaOptions.grep) : undefined;
      this.mochaOptions.grep = undefined;
      this.mocha = new Mocha(this.mochaOptions);

      var mocha = this.mocha;
      var $this = this;
      glob.sync(this.directory + pattern + "**/test/*.js", {}).forEach(function(file){
          if (file.replace('./node_modules', '').indexOf('node_modules') != -1 ||
              grepPattern && !grepPattern.test(file)) {
                return;
          }
          mocha.addFile(file);
      });

      this.mocha.run(function(failures){
        process.exit(failures);
      });
    }

  }
);

module.exports = new Consoloid.Test.Runner();
