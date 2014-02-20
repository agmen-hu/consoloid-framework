defineNamespace('Consoloid.Resource');

global.Consoloid.Resource.TopicLoader = $.inherit(Consoloid.Base.Object,
  {
    loadTopics: function(topics)
    {
      topics = topics || ['framework'];

      var $this = this;
      $.each(topics, function(index, topic) {
        $this.loadTopic.apply($this, [ topic ]);
      });

      return this;
    },

    loadTopic: function(topic)
    {
      var definition;
      if (Consoloid.Resource.TopicLoader.CACHED_DEFINITIONS && Consoloid.Resource.TopicLoader.CACHED_DEFINITIONS[topic]) {
        definition = Consoloid.Resource.TopicLoader.CACHED_DEFINITIONS[topic];
      } else {
        definition = this.get('resource_loader').getDefinitions(topic);
      }

      this.container.addDefinitions(definition, 'topic.' + topic);

      return this;
    }
  },
  {
    CACHED_DEFINITIONS: {}
  }
);
