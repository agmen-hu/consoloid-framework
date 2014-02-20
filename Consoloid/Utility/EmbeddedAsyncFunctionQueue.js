defineClass('Consoloid.Utility.EmbeddedAsyncFunctionQueue', 'Consoloid.Utility.AsyncFunctionQueue',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.requireProperty('parentQueue');

      this.scheduledTasks = [];
      this.parentQueue.push({func: this.__pushTaskToQueue.bind(this), options: {}}, function(){});
    },

    __pushTaskToQueue: function(callback)
    {
      if (!this.scheduledTasks.length) {
        callback();
        return;
      }

      this.queue.drain = callback;

      this.scheduledTasks.forEach(function(task){
        this.queue.push({
          func: task.func,
          options: task.options
        }, task.callback);
      }, this);
    },

    add: function(callback, func, options)
    {
      this.scheduledTasks.push({
        func: func,
        options: options,
        callback: callback,
      });

      return this;
    },

    killQueue: function()
    {
      var drain = this.queue.drain;

      this.__base();
      this.scheduledTasks = [];

      drain();
    }
  }
);
