defineClass('Consoloid.Service.AsyncRPC.BrowserPeer', 'Consoloid.Service.AsyncRPC.BasePeer',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this._setupConnection();
    },

    _setupConnection: function()
    {
      if (!('io' in window)) {
        eval.call(window, this.get('resource_loader').getJs('node_modules/socket.io-client/dist/socket.io.min'));
      }

      this.get('logger').log('debug', 'Connecting to socket.io server at ' + this.get('server').url);

      this.socket = io.connect(this.get('server').url);
      if (!this.socket) {
        throw new Error('Unable to connect to socket.io server at ' + this.get('server').url);
      }

      this._setupListeners();
      this.__registerSession();

      this.get('logger').log('debug', 'Connected to socket.io server.');
    },

    __registerSession: function()
    {
      this.get('logger').log('debug', 'Registering socket.io connection in session.');
      this.socket.emit('connect.register', {
        sessionID: this.__getSessionId()
      });
    },

    __getSessionId: function()
    {
      return decodeURIComponent(document.cookie).match(this.get('server').cookie + '=s:([^\.]+)')[1];
    },

    _handleActualSharedServiceCall: function(req, response)
    {
      var service = this.get(req.service);
      req.args.unshift(function(err, result) {
        if (err) {
          response.sendError(err);
          return true;
        }

        response.sendResult(result);
      });
      service[req.method].apply(service, req.args);
    },
  }
);
