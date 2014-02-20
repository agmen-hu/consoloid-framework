defineClass('Consoloid.Log.DetailProvider.StaticDetail', 'Consoloid.Log.DetailProvider.BaseProvider',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.requireProperty('details');
    },

    provideDetails: function(data)
    {
      data.p = $.extend(data.p || {}, this.details);
      return data;
    }
  }
);