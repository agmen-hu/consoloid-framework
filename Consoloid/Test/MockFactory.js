defineClass('Consoloid.Test.MockFactory', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.requireProperty('sinon');
    },

    create: function(cls)
    {
      cls = typeof cls == 'string' ? getClass(cls) : cls;
      var mock = $.inherit(cls, { __constructor: function(){} });
      mock = new mock();

      for (var prop in mock) {
        if (prop == '__self') {
          // preserve

        } else if (!this.__propertyIsPublicMethod(mock, prop)) {
          delete mock[prop];

        } else {
          mock[prop] = this.sinon.stub();
        }
      }

      return mock;
    },

    __propertyIsPublicMethod: function(object, property)
    {
      return !(typeof object[property] != 'function' || property.match('^_+'));
    }
  }
);
