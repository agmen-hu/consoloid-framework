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