defineClass('Consoloid.Log.Stream.ClientBuffer', 'Consoloid.Log.Stream.PeriodicallyForwardedBuffer',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        server_url: null,
        maxAttemptTime: 100000,
        maxPacketLength: 100
      }, options));

      if (this.maxAttemptTime < this.interval) {
        this.maxAttemptTime = this.interval;
      }

      this.forwardInProgress = false;
      this.forwardAttempts = 0;

      this.__resetPacket = this.__resetPacket.bind(this);
      this.__packetError = this.__packetError.bind(this);

      if (!this.server_url) {
        this.server_url = this.container.get('server').url + "/c";
      }
    },

    _forward: function()
    {
      if (this.buffer.length == 0 && this.packet.length == 0) {
        return;
      }

      if (this.forwardAttempts * this.interval >= this.maxAttemptTime) {
        this.__resetPacket();
      }
      this.forwardAttempts++;

      if (this.forwardInProgress) {
        return;
      }

      this.__fillPacket();
      this.__postData();
    },

    __resetPacket: function()
    {
      this.packet = [];
      this.forwardInProgress = false;
      this.forwardAttempts = 0;
    },

    __fillPacket: function()
    {
      var fillWithAmount = this.maxPacketLength - this.packet.length;
      if (fillWithAmount <= 0) {
        return;
      }
      this.packet = this.packet.concat(this.buffer.splice(0, fillWithAmount));
    },

    __postData: function()
    {
      this.forwardInProgress = true;

      $.ajax({
        type: 'POST',
        url: this.server_url,
        dataType: 'json',
        data: {
          id: 'server_log_buffer',
          method: 'receive',
          arguments:  [{
            logs: this.packet,
            timestamp: new Date().getTime()
          }]
        },
        success: this.__resetPacket,
        error: this.__packetError
      });
    },

    __packetError: function()
    {
      this.forwardInProgress = false;
    }
  }
);