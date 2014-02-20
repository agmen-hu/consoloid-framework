defineClass('Consoloid.Service.Utility.InstanceMethodOverrider', 'Consoloid.Base.Object',
  {
    override: function(obj, methodName, config)
    {
      if (!this.__configIsExists(config)) {
        return;
      }

      if (!this.__configHasProperProperties(config)) {
        throw new Error('Method overrider does not get either service or method name');
      }

      var
        service = this.get(config.service),
        method = config.method;

      if (typeof service[method] != 'function') {
        throw new Error('Method overrider does not has the given method');
      }

      if (this.__preventMethodOverrideOnSharedObject(config)) {
        throw new Error('Method overrider got an options and shared serivce');
      }

      this.__setOptions(service, config.options);

      obj[methodName] = function() {
        return service[method].apply(service, arguments);
      }
    },

    __configIsExists: function(config)
    {
      return config && Object.keys(config).length;
    },

    __configHasProperProperties: function(config)
    {
      return config.service && config.method;
    },

    __preventMethodOverrideOnSharedObject: function(config)
    {
      if (!config.options) {
        return;
      }

      return this.container.getDefinition(config.service).shared == true;
    },

    __setOptions: function(service, options)
    {
      if (!options) {
        return;
      }

      for (prop in options) {
        service['set' + prop[0].toUpperCase() + prop.substr(1)](options[prop]);
      }
    }
  }
);
