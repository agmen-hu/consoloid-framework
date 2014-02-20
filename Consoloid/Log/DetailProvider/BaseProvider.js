defineClass('Consoloid.Log.DetailProvider.BaseProvider', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        autoaddToStream: undefined
      }, options));

      this.provideDetails = this.provideDetails.bind(this);
      if (this.autoaddToStream !== undefined) {
        this.autoaddToStream.addDetailProviderObject(this);
      }
    },

    provideDetails: function(data)
    {
    }
  }
);