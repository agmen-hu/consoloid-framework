defineClass('Consoloid.Service.AsyncRPC.Response', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.requireProperty('callId');
      this.requireProperty('socket');
    },

    send: function(res)
    {
      this.socket.emit('rpc.result', {
        callId: this.callId,
        result: res.result || undefined,
        exception: res.exception || undefined,
        success: res._success
      });
    },

    sendResult: function(result)
    {
      this.send({
        callId: this.callId,
        result: result,
        _success: true
      });
    },

    sendError: function(exception)
    {
      this.send({
        callId: this.callId,
        exception: exception,
        _success: false
      });
    }
  }
);