defineClass('Consoloid.Utility.AsyncFunctionQueue', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.container = options.container;
      var async = options.async || this.__acquireAsync();

      this.__base($.extend({
        async: async,
        queue: options.queue || async.queue(this.__doTasks, 1)
      }, options));
    },

    createChildQueue: function()
    {
      return this.create('Consoloid.Utility.EmbeddedAsyncFunctionQueue', { container: this.container, async: this.async, parentQueue: this.queue});
    },

    __acquireAsync: function()
    {
      if (this.container.has("application")) {
        if (global.async == undefined) {
          eval(this.get('resource_loader').getJs('node_modules/async/lib/async'));
        }
        return async;
      }
      return require('async');
    },

    __doTasks: function(task, callback)
    {
      task.func(callback, task.options)
    },

    setDrain: function(func)
    {
      this.queue.drain = func;

      return this;
    },

    add: function(callback, func, options)
    {
      this.queue.push({
        func: func,
        options: options
      }, callback);

      return this;
    },

    killQueue: function()
    {
      this.queue.kill();
    }
  }
);
