defineClass('Consoloid.Resource.ClassLoader', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      var $this = this;
      this.bind('Consoloid.Base.Object.loadClass', function(event, className) {
        $this.__loadClass.apply($this, [ event, className ]);
      });
    },

    __loadClass: function(event, className)
    {
      var source = this.get('resource_loader').getJs(className.replace(/\./gi,'/'));
      if (!this.__classIsAlreadyDefined(className)) {
        eval(source);
      }
    },

    __classIsAlreadyDefined: function(className)
    {
      var current = global;
      return className.split('.').every(function(value) {
        if (!(value in current)) {
          return false;
        }

        current = current[value];
        return true;
      });
    }
  }
);
