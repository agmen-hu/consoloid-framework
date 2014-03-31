defineClass('Consoloid.Service.ServiceContainer',
  {
    __constructor: function()
    {
      this.services = {};
      this.definitions = {};
    },

    /**
     * Adds a service definition to the container.
     *
     * The structure of definiton hash:
     * var def = {
     *   shared: false|true
     *   cls: <name of class>
     *   options: <options>
     *   tags: <array of tags>
     * };
     *
     * @param name Name of service.
     * @param definition Definition hash for the service.
     */
    addDefinition: function(name, definition)
    {
      if (!('options' in definition)) {
        definition.options = {};
      };
      this.definitions[name] = definition;
      if ('alias' in definition) {
        this.definitions[definition.alias] = definition;
      };
      return this;
    },

    removeDefinition: function(name)
    {
      if (!(name in this.definitions)) {
        throw new Error('No such definition: ' + name);
      }

      delete this.definitions[name];
      if (name in this.services) {
        delete this.services[name];
      }
    },

    getDefinition: function(name)
    {
      if (name in this.definitions) {
        return this.definitions[name];
      }

      throw new Error('No such definition: ' + name);
    },

    addDefinitions: function(definitions, addTag)
    {
      var $this = this;
      addTag = addTag || false;
      $.each(definitions, function(name, definition) {
        if (addTag) {
          definition['tags'] = definition['tags'] || [];
          if ($.inArray(addTag, definition['tags']) == -1) {
            definition['tags'].push(addTag);
          }
        }
        $this.addDefinition.apply($this, [name, definition]);
      });
      return this;
    },

    has: function(name)
    {
      return (this.services[name] || this.definitions[name]) ? true : false;
    },

    get: function(name)
    {
      if (name in this.services) {
        return this.services[name];
      }

      if (!(name in this.definitions)) {
        this.__retrieveDefinition(name);
      }

      var result = this.__createService(name, this.definitions[name]);
      if ('shared' in this.definitions[name] && this.definitions[name].shared == true) {
        this.__storeService(name, result);
      }

      return result;
    },

    __retrieveDefinition: function(name)
    {
      throw new Error("Service is not defined; name='" + name + "'");
    },

    __createService: function(name, definition)
    {
      if (!definition || !definition.cls) {
        throw new Error('Invalid definition for service; name="' + name + '"');
      }

      var cls = typeof definition.cls == 'string' ? getClass(definition.cls) : definition.cls;
      var options = this.__resolveReferences($.extend(true, {}, definition.options || {}));
      options.container = this;

      return new cls(options);
    },

    __resolveReferences: function(options)
    {
      var $this = this;
      $.each(options, function(name, value) {
        if (typeof(value) == 'string' && value[0] == '@') {
          options[name]  = $this.get.apply($this, [ value.substring(1) ]);
        } else if (typeof(value) == 'object') {
          $this.__resolveReferences(value);
        }
      });

      return options;
    },

    __storeService: function(name, service)
    {
      this.services[name] = service;
      if (this.definitions[name].alias) {
        this.services[this.definitions[name].alias] = service;
      }
    },

    addSharedObject: function(name, object)
    {
      this.definitions[name] = {
        shared: true,
        cls: null,
        options: null
      };

      this.services[name] = object;
      return this;
    },

    getAllTagged: function(tags)
    {
      var result = [];
      var $this = this;

      $.each(this.getAllServiceIdsTagged(tags), function(index, name) {
        result.push($this.get.apply($this, [name]));
      });

      return result;
    },

    getAllServiceIdsTagged: function(tags)
    {
      var result = [];
      var $this = this;

      if (!(tags instanceof Array)) {
        tags = [ tags ];
      }

      $.each(this.definitions, function(name, definition) {
        if ($this.__definitionHasAllTags.apply($this, [ definition, tags ])) {
          result.push(name);
        }
      });

      return result;
    },

    __definitionHasAllTags: function(definition, tags)
    {
      var match = true;
      $.each(tags, function(index, tag) {
        if ($.inArray(tag, definition['tags'] || []) == -1) {
          match = false;
        }
      });

      return match;
    }
  }
);
