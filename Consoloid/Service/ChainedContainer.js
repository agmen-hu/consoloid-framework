defineClass('Consoloid.Service.ChainedContainer', 'Consoloid.Service.ServiceContainer',
  {
    __constructor: function(options)
    {
      this.__base();
      $.extend(this, {
        fallback: undefined
      }, options);
    },

    get: function(name)
    {
      if (!(name in this.definitions) && this.fallback) {
        return this.fallback.get(name);
      }

      return this.__base(name);
    },

    getDefinition: function(name)
    {
      if (!(name in this.definitions) && this.fallback) {
        return this.fallback.getDefinition(name);
      }

      return this.__base(name);
    },

    getAllServiceIdsTagged: function(tags)
    {
      var result = this.__base(tags);
      return result.concat(this.fallback.getAllServiceIdsTagged(tags));
    }
  }
);
