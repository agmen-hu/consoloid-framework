var should = require("should");
var sinon = require('sinon');

require("../Handler");

describe('Consoloid.Error.Handler', function(){
  var
    env,
    handler;

  beforeEach(function(){
    env = new Consoloid.Test.Environment();
    handler = env.create('Consoloid.Error.Handler', {});
  });

  describe('#__constructor()', function() {
    it('should register on window.onerror', function() {
      handler.handleError.should.eql(window.onerror);
    });
  });

  describe('event listener returnValue should set properly based on the browser', function(){
    it('should return true on webkit', function(){
      navigator.userAgent = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/535.1 (KHTML, like Gecko) Ubuntu/10.04 Chromium/14.0.804.0 Chrome/14.0.804.0 Safari/535.1';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.true;

      navigator.userAgent = 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.true;

      navigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25'
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.true;

      navigator.userAgent = 'Mozilla/5.0 (Windows; U; Windows NT 6.0; ru-RU) AppleWebKit/528.16 (KHTML, like Gecko) Version/4.0 Safari/528.16';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.true;
    });

    it('should return true on gecko', function(){
      navigator.userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/25.0';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.true;

      navigator.userAgent = 'Mozilla/5.0 (Windows; U; Windows NT 6.1; ro; rv:1.9.2.10) Gecko/20100914 Firefox/3.6.10';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.true;
    });

    it('should return false on opera', function(){
      navigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0) Opera 12.14';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.false;

      navigator.userAgent = 'Opera/9.02 (Windows; U; nl)';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.false;
    });

    it('should return false on IE', function(){
      navigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.false;

      navigator.userAgent = 'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.false;
    });

    it('return true when user agent is unknow', function(){
      navigator.userAgent = 'Mozilla/5.0';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.true;

      navigator.userAgent = '(Windows; U; Windows NT 6.1; ro; rv:1.9.2.10)';
      handler = env.create('Consoloid.Error.Handler', {});
      handler.returnValue.should.be.true;
    });
  });

  describe('#handleError(errorMsg, url, lineNumber)', function() {
    beforeEach(function() {
      env.addServiceMock('translator', {
        trans: function(msg) { return msg; }
      });
    })

    it('should alert when the error is a UserMessage', function() {
      global.alert = sinon.spy();

      handler.handleError('UserMessage: test message', 'url', 1);

      global.alert.calledOnce.should.be.ok;
    });

    it('should not alert when the error is not UserMessage', function() {
      global.alert = sinon.spy();

      handler.handleError('Error: test message', 'url', 1);

      global.alert.calledOnce.should.not.be.ok;
    });

    it('should log all error messages', function(){
      var spy = sinon.spy(handler, '__logError');

      handler.handleError('UserMessage: test message', 'url', 1);

      spy.calledOnce.should.be.true;
      spy.calledWithExactly('UserMessage', 'test message');
    });
  });

  describe('#__parseErrorMsg', function() {
    it('should parse error type and original message from error string', function() {
      handler.__parseErrorMsg('TestError: test message').should.eql({
        type: 'TestError',
        message: 'test message'
      })
    });

    it('should handle non standard error strings', function() {
      handler.__parseErrorMsg('test message').should.eql({
        type: 'Error',
        message: 'test message'
      })
    });

    it('should parse browser specific error message', function() {
      handler.__parseErrorMsg('uncaught Error: test message').should.eql({
        type: 'Error',
        message: 'test message'
      });
      handler.__parseErrorMsg('Uncaught Error: test message').should.eql({
        type: 'Error',
        message: 'test message'
      });
      handler.__parseErrorMsg('uncaught exception: Error: test message').should.eql({
        type: 'Error',
        message: 'test message'
      });
      handler.__parseErrorMsg('Uncaught exception: Error: test message').should.eql({
        type: 'Error',
        message: 'test message'
      })
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
