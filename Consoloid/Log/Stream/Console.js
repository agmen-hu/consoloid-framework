defineClass('Consoloid.Log.Stream.Console', 'Consoloid.Log.Stream.Stream',
  {
    write: function(object)
    {
      if (!this.__validateObject(object)) {
        throw new Error('Log object is not valid.')
      }

      var logMethod;
      switch(object.l) {
        case 'debug':
          logMethod = 'debug';
          break;
        case 'info':
          logMethod = 'info';
          break;
        case 'warning':
          logMethod = 'warn';
          break;
        case 'error':
          logMethod = 'error';
          break;
        default:
          logMethod = 'log';
      }

      if (!console[logMethod] || typeof console[logMethod] != 'function' ) {
        logMethod = 'log';
      }

      console[logMethod](
        new Date(object.t).toLocaleString() + ' ' + object.l + ': ' + object.m, object.p
      );
    },

    __validateObject: function(object)
    {
      if (object.l == undefined || typeof object.l != 'string' || object.l == '') {
        return false;
      }
      if (object.t == undefined || typeof object.t != 'number' || object.t % 1 != 0) {
        return false;
      }
      if (object.m == undefined || typeof object.m != 'string' || object.m == '') {
        return false;
      }
      if (object.p != undefined && typeof object.p != 'object') {
        return false;
      }

      return true;
    }
  }
);