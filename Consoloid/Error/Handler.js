defineClass('Consoloid.Error.Handler', 'Consoloid.Base.Object',
{
  __constructor: function(options)
  {
    this.__base(options);
    this.returnValue = this.__decideReturnValueByBrowser();
    this.handleError = this.handleError.bind(this);
    window.onerror = this.handleError;
  },

  __decideReturnValueByBrowser: function ()
  {
    if (jQuery.browser.webkit) {
      return true;
    } else if (jQuery.browser.msie) {
      return false;
    } else if (jQuery.browser.mozilla) {
      return true;
    } else if (jQuery.browser.opera) {
      return false;
    }

    return true;
  },

  handleError: function (errorMsg, url, lineNumber)
  {
    var parsedErrorMsg = this.__parseErrorMsg(errorMsg);
    if(parsedErrorMsg.type == 'UserMessage') {
      alert(this.get('translator').trans(parsedErrorMsg.message));
    }

    this.__logError(parsedErrorMsg.type, parsedErrorMsg.message);

    return this.returnValue;
  },

  __parseErrorMsg: function (errorMsg)
  {
    var parsed = errorMsg.match(/^(uncaught exception: |Uncaught exception: |uncaught |Uncaught )?(\w+): (.*)$/) || { 2: 'Error', 3: errorMsg };
    return {
      type: parsed[2],
      message: parsed[3]
    };
  },

  __logError: function(type, message)
  {
    this.container.get('logger')
      .log(type == 'UserMessage' ? 'debug' : 'error', message);
  }
});
