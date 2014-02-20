defineClass('Consoloid.Application.Application', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      if (!('server' in options) || !('url' in options.server)) {
        throw new Error('server.url must be given in options');
      }

      this.container = new Consoloid.Service.ClientSideContainer({
        server_url: options.server.url +  "/d"
      });

      this.__createSharedObjects(options);

      this.container
        .addDefinitions({
          class_loader: {
            cls: Consoloid.Resource.ClassLoader,
            shared: true
          },
          topic_loader: {
            cls: Consoloid.Resource.TopicLoader
          },
          error_handler: {
            cls: Consoloid.Error.Handler,
            shared: true
          }
        })
        .addSharedObject('application', this);

      if (options.server.environment != "dev") {
        this.container.get('error_handler');
      }
    },

    __createSharedObjects: function(options)
    {
      var $this = this;
      $.each(options, function(name, data) {
        $this.container.addSharedObject(name, data);
      });
    },

    loadTopics: function(topics)
    {
      // create the shared instance of class loader.
      this.get('class_loader');

      this.get('topic_loader')
        .loadTopics(topics);

      return this;
    }
  }
);
