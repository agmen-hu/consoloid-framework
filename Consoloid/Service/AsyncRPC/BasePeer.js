defineClass('Consoloid.Service.AsyncRPC.BasePeer', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        defaultOnSuccess: this.defaultOnSuccess.bind(this),
        defaultOnError: this.defaultOnError.bind(this),
        defaultOnTimeout: this.defaultOnTimeout.bind(this),
        defaultMaxResponseTime: 60000,
        socket: undefined,
      }, options), {overridableMethods: ['defaultOnSuccess', 'defaultOnError', 'defaultOnTimeout'] });

      this.connected = false;
      this.pendingCalls = {};
    },

    isConnected: function()
    {
      return this.connected;
    },

    defaultOnSuccess: function(data)
    {
      this.get('logger').log('debug', 'SocketIO call succeeded', { response: data });
    },

    defaultOnError: function(error)
    {
      this.get('logger').log('debug', 'SocketIO call failed', { error: error });
    },

    defaultOnTimeout: function(callId)
    {
      this.get('logger').log('debug', 'SocketIO call timed out', { callId: callId});
      this.__clearCall(callId);
    },

    __clearCall: function(callId)
    {
      if (this.__isRunning(callId)) {
        delete this.pendingCalls[callId];
      }
    },

    __isRunning: function(callId)
    {
      return (callId in this.pendingCalls);
    },

    _setupListeners: function()
    {
      this.socket.on('connect', this._handleSocketConnected.bind(this));
      this.socket.on('disconnect', this._handleSocketDisconnected.bind(this));

      this.socket.on('rpc.callShared', this._handleSharedServiceCallRequest.bind(this));
      this.socket.on('rpc.call', this._handleServiceCallRequest.bind(this));
      this.socket.on('rpc.result', this._receiveResult.bind(this));
    },

    _handleSocketConnected: function()
    {
      this.connected = true;
    },

    _handleSocketDisconnected: function()
    {
      this.connected = false;
    },

    _handleSharedServiceCallRequest: function(req)
    {
      this._validateSharedCallRequest(req);

      var response = this.create('Consoloid.Service.AsyncRPC.Response', {
        callId: req.callId,
        socket: this.socket,
        container: this.container
      });

      try {
        this._handleActualSharedServiceCall(req, response);
      } catch (err) {
        response.sendError(err.toString());
      }
    },

    _handleActualSharedServiceCall: function(req, response)
    {
      var service = this.get(req.service);
      response.sendResult(service[req.method].apply(service, req.args));
    },

    _validateSharedCallRequest: function(req)
    {
      if (!req || !('callId' in req) ||
          !('service' in req) || !('method' in req) || !('args' in req) ||
          req.callId ===undefined ||  !req.service || !req.method || !req.args
      ) {
        throw new Error('Shared async call request requires callId, service name and method name with arguments.');
      }
    },

    _handleServiceCallRequest: function(req)
    {
      throw new Error('This AsyncRPC peer does not support calling non-shared services');
    },

    _receiveResult: function(res)
    {
      if (!res || !res.callId || (!res.result && !res.exception) || res.success === undefined) {
        throw new Error('Async call received result without callId, success flag or result.');
      }

      this.get('logger').log('debug', 'Received async call result', res);

      if(!this.__isRunning(res.callId)) {
        return;
      }

      clearTimeout(this.pendingCalls[res.callId].timeout);

      if (res.success) {
        this.pendingCalls[res.callId].success(res.result);
      } else {
        this.pendingCalls[res.callId].error(res.exception);
      }

      this.__clearCall(res.callId);
    },

    callAsyncOnSharedService: function(service, method, args, success, error, timeout, maxResponseTime)
    {
      if(!service || !method) {
        throw new Error('Async call requires service name and method name.');
      }

      var params = {
          callId: this.__createPendingCall(success, error, timeout, maxResponseTime),
          sessionID: this.__getSessionId(),
          service: service,
          method: method,
          args: args || []
        };

      this.get('logger').log('debug', 'Calling method of remote shared service asyncly.', params);
      this.socket.emit('rpc.callShared', params);
    },

    __createPendingCall: function(success, error, timeout, maxResponseTime)
    {
      var callId = this.__self.callIdCounter++;

      this.pendingCalls[callId] = {
        success: success || this.defaultOnSuccess,
        error: error || this.defaultOnError,
        timeout: setTimeout(function() {
            (timeout || this.defaultOnTimeout)(callId);
          }.bind(this),
          (maxResponseTime || this.defaultMaxResponseTime)
        )
      };

      return callId;
    },

    __getSessionId: function()
    {
    },

    callAsyncOnService: function(instanceId, method, args, success, error, timeout, maxResponseTime)
    {
      if(instanceId === undefined || !method) {
        throw new Error('Async call requires instanceId and method name.');
      }

      var params = {
          callId: this.__createPendingCall(success, error, timeout, maxResponseTime),
          sessionID: this.__getSessionId(),
          instanceId: instanceId,
          method: method,
          args: args || []
        };

      this.get('logger').log('debug', 'Calling method of remote service asyncly.', params);
      this.socket.emit('rpc.call', params);
    },

    getSocket: function()
    {
      return this.socket;
    }
  },
  {
    callIdCounter: 1
  }
);
