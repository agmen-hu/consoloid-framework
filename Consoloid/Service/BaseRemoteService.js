defineClass('Consoloid.Service.BaseRemoteService',
  {
    __constructor: function(options)
    {
      this.__options = $.extend({
        id: null,
        methods: [], // { name: <name> }
        server_url: null,
        container: null,
      }, options);

      this.__createStubs();
    },

    __createStubs: function()
    {
      var $this = this;
      $.each(this.__options.methods, function(index, method) {
        if (method.name == 'callAsync') {
          return;
        }
        $this[method.name] = function() {
          return $this.__callRemoteMethod.apply($this, [method, arguments]);
        };
      });
    },

    __callRemoteMethod: function(method, callArguments)
    {
      var callData = {
        id: this.__options.id,
        method: method.name,
        arguments: callArguments
      }

      return this.__startCall(method, callData);
    },

    __startCall: function (method, callData)
    {
      var result = null;

      $.ajax({
        type: 'POST',
        url: this.__options.server_url,
        dataType: 'json',
        data: callData,
        success: function(data) {
          if (data.exception) {
            throw new Consoloid.Error.WrappedException(data.exception);
          }
          result = data.result;

          if (method.success) {
            method.success(result);
          }

          return result;
        },
        async: false
      });

      return result;
    }
  }
);
