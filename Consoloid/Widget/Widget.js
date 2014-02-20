defineClass('Consoloid.Widget.Widget', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      $.extend(this, {
        template: null,
        node: $('<div />'),
      }, options);

      if ('id' in this && this.id) {
        var node = $('#' + this.id);
        if (node.length == 1) {
          this.node = node;
        } else {
          this.node = $('<div id="'+this.id+'"></div>');
        }
      }

      if ('templateId' in this && this.templateId) {
        this.template = this.create('Consoloid.Widget.JQoteTemplate', {
          id: this.templateId,
          container: this.container
        });
      }
      this.eventListeners = []; // [ { selector: <selector for find>, event: <event_name>, callback: <callback> }, ... ]
    },

    setNode: function(node)
    {
      this.node = node;
      return this;
    },

    addEventListener: function(selector, event, callback)
    {
      this.eventListeners.push({selector: selector, event: event, callback: callback});
      return this;
    },

    render: function()
    {
      this.node.empty().jqoteapp(this.template.get(), this);
      this._bindEventListeners();
      return this;
    },

    _bindEventListeners: function()
    {
      var $this = this;
      $.each(this.eventListeners, function(index, definition) {
        $this.node.find(definition.selector).bind(definition.event, function(event) {
          return definition.callback.apply($this, [event]);
        });
      });
    }
  }
);
