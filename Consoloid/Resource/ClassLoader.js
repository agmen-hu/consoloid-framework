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
      eval(
        this.get('resource_loader').getJs(className.replace(/\./gi,'/'))
      );
    }
  }
);
