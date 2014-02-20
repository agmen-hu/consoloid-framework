
(function(){
  global.defineNamespace = function(namespace)
  {
    var current = global;
    $.each(namespace.split('.'), function(index, value) {
      if (!(value in current)) {
        current[value] = {};
      }
      current = current[value];
    });

    return current;
  };

  var storeClass = function(className, cls)
  {
    var lastIndexOfDot = className.lastIndexOf('.');
    var namespace = global;
    if (lastIndexOfDot != -1) {
      namespace = defineNamespace(className.substr(0, lastIndexOfDot));
      className = className.substr(lastIndexOfDot + 1);
    }
    namespace[className] = cls;
  };

  global.getClass = function(className)
  {
    var current = global;
    $.each(className.split('.'), function(index, value) {
      if (!(value in current)) {
        $(document).trigger('Consoloid.Base.Object.loadClass', className);
      }

      if (!(value in current)) {
        throw new Error('No such class; className="' + className + '"');
      }
      current = current[value];
    });

    return current;
  };

  global.defineClass = function(className, parentClass, methods, staticMethods)
  {
    if (typeof parentClass == 'string') {
      parentClass = getClass(parentClass);
    }

    storeClass(className, $.inherit(parentClass, methods, staticMethods));
  };
}());

defineClass('Consoloid.Base.Object',
  {
    __constructor: function(options, instancePolicy)
    {
      this._methodOverrider(options, instancePolicy);
      $.extend(this, {
        container: null
      }, options);
    },

    _methodOverrider: function(options, instancePolicy)
    {
      if (!options || !Object.keys(options).length) {
        return;
      }

      var
        instancePolicyHasMethodOverrideAllower = instancePolicy && instancePolicy.overridableMethods,
        configuredMethodOverriderIsAvaialble = options.container && options.container.has('instance_method_overrider');

      for(var prop in options) {
        if (!this[prop] || typeof this[prop] != 'function') {
          continue;
        }

        if (!instancePolicyHasMethodOverrideAllower || instancePolicy.overridableMethods.indexOf(prop) == -1) {
          throw new Error('Method ' + prop + ' cannot be overrided');
        }

        if (typeof options[prop] == 'function') {
          this[prop] = options[prop];
        } else {
          if (!configuredMethodOverriderIsAvaialble) {
            throw new Error('For method overriding use of instance_method_overrider service is required');
          }
          options.container.get('instance_method_overrider').override(this, prop, options[prop]);
        }

        delete options[prop];
      }
    },

    get: function(serviceName)
    {
      return this.container.get(serviceName);
    },

    create: function(cls, options)
    {
      if (typeof cls == 'string') {
        cls = getClass(cls);
      }

      return new cls(options);
    },

    bind: function(event, fn)
    {
      $(document).bind(event, fn);
    },

    trigger: function(event, parameters)
    {
      $(document).trigger(event, parameters);
    },

    /**
     * Checks that a property exists.
     *
     * Should be used from constructors to check proper parameter injection.
     *
     * @param name string Name of property
     * @throws Error When property is missing.
     */
    requireProperty: function(name)
    {
      if (!(name in this)) {
        throw new Error(name + ' must be injected');
      }
    }
  }
);
