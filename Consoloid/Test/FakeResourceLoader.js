defineNamespace('Consoloid.Test');

global.Consoloid.Test.FakeResourceLoader = $.inherit(Consoloid.Base.Object,
  {
    getDefinitions: function(topic)
    {
      throw new Error('Unexpected call to getDefinitions; topic="' + topic + '"');
    },

    getJs: function(name)
    {
      throw new Error('Unexpected call to getJs; name="' + name + '"');
    },

    getTemplate: function(name)
    {
      throw new Error('Unexpected call to getTemplate; name="' + name + '"');
    },

    getFinder: function()
    {
      throw new Error('Unexpected call to getFinder');
    }
  }
);