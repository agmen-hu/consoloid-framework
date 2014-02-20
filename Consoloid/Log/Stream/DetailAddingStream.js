defineClass('Consoloid.Log.Stream.DetailAddingStream','Consoloid.Log.Stream.Stream',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.requireProperty('nextStream');
      this.detailProviders = [];
    },

    addDetailProviderFunction: function(fn)
    {
      this.detailProviders.push(fn);
      return this;
    },

    addDetailProviderObject: function(provider)
    {
      if (!(provider instanceof getClass('Consoloid.Log.DetailProvider.BaseProvider'))) {
        throw new Error('Provider object must be an instance of Consoloid.Log.DetailProvider.BaseProvider');
      }

      this.detailProviders.push(provider.provideDetails);
      return this;
    },

    getDetailProviders: function()
    {
      return this.detailProviders;
    },

    write: function(data)
    {
      this.detailProviders.forEach(function(provider) {
        data = provider(data);
      });
      this.nextStream.write(data);
    }
  }
);