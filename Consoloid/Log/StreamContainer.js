defineClass('Consoloid.Log.StreamContainer', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        streams: [],
        streamServices: []
      }, options));

      this.__appendStreamsFromServices();
    },

    __appendStreamsFromServices: function()
    {
      for (var i = 0, len = this.streamServices.length; i < len; i++) {
        this.addStream(this.container.get(this.streamServices[i]));
      }
    },

    addStream: function(object)
    {
      if (!(object instanceof Consoloid.Log.Stream.Stream)) {
        throw new Error('Object is not an insance of Consoloid.Log.Stream.Stream');
      }
      this.streams.push(object);
    }
  }
)