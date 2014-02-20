defineClass('Consoloid.Widget.JQoteTemplate', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      $.extend(this, {
        container: null,
        id: null,
      }, options);
    },

    setId: function(id)
    {
      this.id = id;
      return this;
    },

    get: function()
    {
      var result = $('#' + this.id);
      if (result.length == 0) {
        this.load();
      }

      result = $('#' + this.id);
      if (result.length == 0) {
        throw new Error("Template not found; id='" + this.id + "'");
      }
      return result;
    },

    load: function()
    {
      $(document.body).append(this.container.get('resource_loader').getTemplate(this.id));
    }
  },
  {
  }
);
