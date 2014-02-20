defineClass('Consoloid.Log.Stream.PeriodicallyForwardedBuffer', 'Consoloid.Log.Stream.Stream',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        interval: 20000,
      }, options));

      this.buffer = [];
      this.packet = [];

      this.scheduled = false;
      this._forward = this._forward.bind(this);

      this._scheduleForward();
    },

    _scheduleForward: function()
    {
      this.intervalId = setInterval(this._forward, this.interval);
      this.scheduled = true;
    },

    _unScheduleForward: function()
    {
      clearInterval(this.intervalId);
      this.scheduled = false;
    },

    write: function(object)
    {
      this.buffer.push(object);
    },

    _forward: function()
    {
    }
  }
);