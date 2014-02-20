defineClass('Consoloid.Service.ClientSideContainer', 'Consoloid.Service.ServiceContainer',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.options = $.extend({
        server_url: null,
        preload_definitions: false,
        container: null,
      }, options);

      if (!this.options.server_url) {
        throw new Error('server_url option is required');
      }

      if (this.options.preload_definitions) {
        this.__retrieveDefinitions();
      }
    },

    __retrieveDefinitions: function()
    {
      var $this = this;
      this.__callServer({ retrieveAll: true }, function(data) {
        $this.definitions = data.definitions;
      });
    },

    __callServer: function(data, success)
    {
      $.ajax({
        type: 'POST',
        url: this.options.server_url,
        dataType: 'json',
        data: data,
        success: success,
        async: false
      });
    },

    __retrieveDefinition: function(name)
    {
      if (Consoloid.Service.ClientSideContainer.CACHED_DEFINITIONS && Consoloid.Service.ClientSideContainer.CACHED_DEFINITIONS[name]) {
        this.__storeRemoteServiceDefinition(name, Consoloid.Service.ClientSideContainer.CACHED_DEFINITIONS[name]);
      } else {
        this.__callServer({ service: name }, function(data) {
          this.__storeRemoteServiceDefinition(name, data);
        }.bind(this));
      }
    },

    __storeRemoteServiceDefinition: function(name, data)
    {
      var className = data.definition.shared ? 'Consoloid.Service.RemoteSharedService' : 'Consoloid.Service.RemoteService';
      this.definitions[name] = {
        shared: data.definition.shared ? true : false,
        cls: className,
        options: data.definition
      };
    }
  },
  {
    CACHED_DEFINITIONS: {}
  }
);
