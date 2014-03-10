defineClass('Consoloid.Service.RemoteService', 'Consoloid.Service.BaseRemoteService',
  {
    __constructor: function(options)
    {
      $.each(options.methods, function(index, method) {
        if (method.name === "destroyService") {
          throw new Error("Service had a method name destroyService");
        }
      });

      options.methods.push({
        name: "destroyService",
        async: false
      });

      this.__base(options);

      if (!this.__options.server_url) {
        this.__options.server_url = this.__options.container.get('server').url + "/m";
      }

      if (!this.__options.server_create_instance_url) {
        this.__options.server_create_instance_url = this.__options.container.get('server').url + "/i";
      }

      this.__getInstanceId();
    },

    __getInstanceId: function()
    {
      var $this = this;
      $.ajax({
        type: 'POST',
        url: this.__options.server_create_instance_url,
        dataType: 'json',
        data: {
          id: this.__options.id,
        },
        success: function(data) {
          if (data.exception) {
            throw new Consoloid.Error.WrappedException(data.exception);
          }
          $this.__options.instanceID = data.result;
        },
        async: false
      });

      if ($this.__options.instanceID === undefined) {
        throw new Error('No instance ID given.');
      }
    },

    __callRemoteMethod: function(method, callArguments)
    {
      var callData = {
        instanceId: this.__options.instanceID,
        method: method.name,
        arguments: callArguments
      }

      return this.__startCall(method, callData);
    },

    callAsync: function(method, args, callbacks, maxResponseTime)
    {
      this.__options.container.get('async_rpc_handler_client').callAsyncOnService(
          this.__options.instanceID,
          method,
          args,
          callbacks.success || undefined,
          callbacks.error || undefined,
          callbacks.timeout || undefined,
          maxResponseTime
      );
    }
  }
);
