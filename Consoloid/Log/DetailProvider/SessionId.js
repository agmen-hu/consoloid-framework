defineClass('Consoloid.Log.DetailProvider.SessionId', 'Consoloid.Log.DetailProvider.BaseProvider',
  {
    provideDetails: function(data)
    {
      data.p = $.extend(data.p, {
        sessionId: this.container.getSessionId()
      });
      return data;
    }
  }
);