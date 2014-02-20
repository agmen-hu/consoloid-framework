defineClass('Consoloid.Log.BaseLogger', 'Consoloid.Log.StreamContainer',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        levels: {
          'debug': 0,
          'info': 3,
          'warning': 5,
          'error': 7,
          'disabled': 1000
        },
        levelName: 'info'
      }, options));

      this.setLevelByName(this.levelName);
    },

    setLevelByName: function(levelName)
    {
      this.level = this.__convertStringToLevel(levelName);
      this.levelName = levelName;
    },

    __convertStringToLevel: function(levelName)
    {
      var level = this.levels[levelName];
      if (level === undefined) {
        throw new Error('Logger level: ' + levelName + ' does not exist.');
      }
      return level;
    },

    log: function(levelName, message, parameters)
    {
      var level = this.__convertStringToLevel(levelName);
      if (level < this.level) {
        return;
      };

      var data = {
        t: new Date().getTime(),
        l: levelName,
        m: message,
        p: parameters || {}
      }

      this.streams.forEach(function(stream){
        stream.write(data);
      });
    }
  }
);