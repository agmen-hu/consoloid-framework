defineClass('Consoloid.Base.DeepAssoc', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        delimiter: '/',
        value: {}
      }, options));
    },

    get: function(path, defaultValue)
    {
      if (this.__isAllContent(path)) {
        return this.value;
      }

      var items = path.split(this.delimiter);
      var result = this.value;

      for (var i in items) {
        if (result instanceof Object && items[i] in result) {
          result = result[items[i]];
        } else {
          return defaultValue;
        }
      }

      return result;
    },

    __isAllContent: function(path)
    {
      if (typeof(path) != 'string') {
        throw new Error('path must be a string');
      }

      if (path.length == 0 || path == this.delimiter) {
        return true;
      }

      return false;
    },

    require: function(path, type)
    {
      var result = this.get(path);
      type = type || Object;
      switch (type) {
        case 'boolean':
        case 'bool':
          if (typeof result != 'boolean') {
            throw new Error('Value on path ' + path + ' is not a boolean');
          }
          break;

        case 'string':
          if (typeof result != 'string') {
            throw new Error('Value on path ' + path + ' is not a string');
          }
          break;

        default:
          if (typeof type == 'string') {
            type = getClass(type);
          }
          if (!(result instanceof type)) {
            throw new Error('Value on path ' + path + ' is not an object with required class.');
          }
      }

      return result;
    },

    set: function(path, value)
    {
      if (this.__isAllContent(path)) {
        this.value = value;
        return this;
      }

      var items = path.split(this.delimiter);
      var current = this.value;

      for (var i = 0, length = items.length ; i < length - 1; i++) {
        this.__isObject(i, current);

        if (!this.__isInObject(items[i], current, true)) {
          current[items[i]] = {};
        }

        current = current[items[i]];

      }

      this.__isObject(i, current);

      current[items[i]] = value;
      return this;
    },

    __isObject: function(index, value, notRequired)
    {
      if (value instanceof Object) {
        return true;
      }

      if (notRequired) {
        return false;
      } else {
        throw new Error('Item at ' + index + ' is not an object');
      }
    },

    __isInObject: function(key, object, notRequired)
    {
      if (key in object) {
        return true;
      }

      if (notRequired) {
        return false;
      } else {
        throw new Error('Item at ' + key + ' is not in the object');
      }
    },

    remove: function(path, notRequired)
    {
      var oldValue;

      if (this.__isAllContent(path)) {
        oldValue = this.value;
        this.value = {};
        return oldValue;
      }

      var items = path.split(this.delimiter);
      var current = this.value;

      for (var i = 0, length = items.length ; i < length - 1; i++) {
        if (!this.__isObject(i, current, notRequired)) {
          return;
        }

        if (!this.__isInObject(items[i], current, notRequired)) {
          return;
        }

        current = current[items[i]];
      }

      if (!this.__isInObject(items[i], current, notRequired)) {
        return;
      }

      oldValue = current[items[i]];
      delete current[items[i]];
      return oldValue;
    },

    merge: function(object)
    {
      this.value = $.extend(true, this.value, object);
    }
  }
);