defineClass('Consoloid.Service.RemoteSharedService', 'Consoloid.Service.BaseRemoteService',
  {
    __constructor: function(options)
    {
      this.__base(options);

      if (!this.__options.server_url) {
        this.__options.server_url = this.__options.container.get('server').url + "/c";
      }
    },

    callAsync: function(method, args, callbacks, maxResponseTime)
    {
      this.__options.container.get('async_rpc_handler_client').callAsyncOnSharedService(
          this.__options.id,
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
