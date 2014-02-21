require('../BasePeer');
require('../Response');
require('../../../Test/UnitTest');
describeUnitTest('Consoloid.Service.AsyncRPC.BasePeer', function() {
  var
    clock,
    handler,
    serviceMock;

  beforeEach(function() {
    clock = sinon.useFakeTimers();

    handler = env.create('Consoloid.Service.AsyncRPC.BasePeer', {});
    handler.__self.callIdCounter = 1;
    handler.socket = {
      emit: sinon.spy(),
      on: sinon.spy()
    };

    sinon.stub(handler, '__getSessionId').returns('sesssion_id');
    sinon.spy(handler, 'defaultOnSuccess');
    sinon.spy(handler, 'defaultOnError');
    sinon.spy(handler, 'defaultOnTimeout');

    serviceMock = env.addServiceMock('service', {
      method: sinon.mock().returns('service test')
    });
  });

  describe('#_setupListeners()', function() {
    it('should bind rpc.callShared event to _handleSharedServiceCallRequest()', function() {
      handler._setupListeners();

      handler.socket.on.callCount.should.equal(5);
      handler.socket.on.args[2][0].should.be.eql('rpc.callShared');
    });

    it('should bind rpc.callShared event to _handleSharedServiceCallRequest()', function() {
      handler._setupListeners();

      handler.socket.on.callCount.should.equal(5);
      handler.socket.on.args[3][0].should.be.eql('rpc.call');
    });

    it('should bind rpc.result event to _receiveResult()', function() {
      handler._setupListeners(handler.socket);

      handler.socket.on.callCount.should.equal(5);
      handler.socket.on.args[4][0].should.be.eql('rpc.result');
    });
  });

  describe('#callAsyncOnSharedService(service, method, args, success, error, timeout, maxResponseTime)', function() {
    it('should throw error if service or method to call is not defined in arguments', function () {
      (function() {
        handler.callAsyncOnSharedService();
      }).should.throwError('Async call requires service name and method name.');
    });

    it('should create an object with unique call id, success and error callbacks', function() {
      handler.callAsyncOnSharedService('service', 'method', 'args', 'success', 'error');

      handler.pendingCalls.should.have.property('1');
      handler.pendingCalls[1].success.should.be.equal('success');
      handler.pendingCalls[1].error.should.be.equal('error');
    });

    it('should bind default success and error events to the default callbacks if not given in arguments', function() {
      handler.callAsyncOnSharedService('service', 'method', 'args');

      handler.pendingCalls[1].success.should.be.equal(handler.defaultOnSuccess);
      handler.pendingCalls[1].error.should.be.equal(handler.defaultOnError);
    });

    it('should send request with call id, session id, service, method and arguments', function() {
      handler.callAsyncOnSharedService('service', 'method', 'args');

      handler.socket.emit.calledOnce.should.be.true;
      handler.socket.emit.calledWithExactly('rpc.callShared', {
        callId: 1,
        sessionID: 'session_id',
        service: 'service',
        method: 'method',
        args: 'args'
      });
    });

    it('should increase unique call id after it was set', function() {
      handler.__self.callIdCounter.should.be.eql(1);
      handler.callAsyncOnSharedService('service', 'method', 'args');

      handler.__self.callIdCounter.should.be.eql(2);
      handler.callAsyncOnSharedService('service', 'method', 'args');

      handler.__self.callIdCounter.should.be.eql(3);
    });

    it('should set a timer for handling request timeout', function() {
      handler.callAsyncOnSharedService('service', 'method', 'args');

      clock.tick(handler.defaultMaxResponseTime - 1);
      handler.defaultOnTimeout.calledOnce.should.be.false;
      clock.tick(1);
      handler.defaultOnTimeout.calledOnce.should.be.true;
    });
  });

  describe('#callAsyncOnService(instanceId, method, args, success, error, timeout, maxResponseTime)', function() {
    it('should throw error if instanceId or method to call is not defined in arguments', function () {
      (function() {
        handler.callAsyncOnService();
      }).should.throwError('Async call requires instanceId and method name.');
    });

    it('should create an object with unique call id, success and error callbacks', function() {
      handler.callAsyncOnService('instance', 'method', 'args', 'success', 'error');

      handler.pendingCalls.should.have.property('1');
      handler.pendingCalls[1].success.should.be.equal('success');
      handler.pendingCalls[1].error.should.be.equal('error');
    });

    it('should bind default success and error events to the default callbacks if not given in arguments', function() {
      handler.callAsyncOnService('instance', 'method', 'args');

      handler.pendingCalls[1].success.should.be.equal(handler.defaultOnSuccess);
      handler.pendingCalls[1].error.should.be.equal(handler.defaultOnError);
    });

    it('should send request with call id, session id, service, method and arguments', function() {
      handler.callAsyncOnService('instance', 'method', 'args');

      handler.socket.emit.calledOnce.should.be.true;
      handler.socket.emit.calledWithExactly('rpc.callShared', {
        callId: 1,
        sessionID: 'session_id',
        instanceId: 'instance',
        method: 'method',
        args: 'args'
      });
    });

    it('should increase unique call id after it was set', function() {
      handler.__self.callIdCounter.should.be.eql(1);
      handler.callAsyncOnService('instance', 'method', 'args');

      handler.__self.callIdCounter.should.be.eql(2);
      handler.callAsyncOnService('instance', 'method', 'args');

      handler.__self.callIdCounter.should.be.eql(3);
    });
  });

  describe('#_handleSharedServiceCallRequest(req)', function() {
    it('should throw error if request does not include callId, service, method and args', function() {
      (function() {
        handler._handleSharedServiceCallRequest();
      }).should.throwError('Shared async call request requires callId, service name and method name with arguments.');

      (function() {
        handler._handleSharedServiceCallRequest({callId: 1});
      }).should.throwError('Shared async call request requires callId, service name and method name with arguments.');

      (function() {
        handler._handleSharedServiceCallRequest({callId: 1, service: 'service'});
      }).should.throwError('Shared async call request requires callId, service name and method name with arguments.');

      (function() {
        handler._handleSharedServiceCallRequest({callId: 1, service: 'service', method: 'method'});
      }).should.throwError('Shared async call request requires callId, service name and method name with arguments.');
    });

    it('should create the service and call the method on it', function() {
      handler._handleSharedServiceCallRequest({
        callId: 1,
        sessionID: 'session-1',
        service: 'service',
        method: 'method',
        args: ['test', ['test']]
      });

      serviceMock.container.services.service.method.calledOnce.should.be.true;
      serviceMock.container.services.service.method.calledWithExactly('test', ['test']).should.be.true;
    });

    it('should send back the result on success', function() {
      handler._handleSharedServiceCallRequest({
        callId: 1,
        sessionID: 'session-1',
        service: 'service',
        method: 'method',
        args: ['test', ['test']]
      });

      handler.socket.emit.calledOnce.should.be.true;
      handler.socket.emit.calledWith('rpc.result', {
        callId: 1,
        result: 'service test',
        exception: undefined,
        success: true
      }).should.be.true;
    });

    it('should send back the exception on error', function() {
      serviceMock.container.services.service.method = sinon.stub().throws();

      handler._handleSharedServiceCallRequest({
        callId: 1,
        sessionID: 'session-1',
        service: 'service',
        method: 'method',
        args: ['test', ['test']]
      });

      handler.socket.emit.calledOnce.should.be.true;
      handler.socket.emit.calledWith('rpc.result', {
        callId: 1,
        result: undefined,
        exception: 'Error: Error',
        success: false
      }).should.be.true;
    });
  });

  describe('#_receiveResult(res)', function() {
    it('should throw error if response data does not include callId result, or success flag', function() {
      (function() {
        handler._receiveResult();
      }).should.throwError('Async call received result without callId, success flag or result.');

      (function() {
        handler._receiveResult({callId: 1});
      }).should.throwError('Async call received result without callId, success flag or result.');

      (function() {
        handler._receiveResult({callId: 1, result: {}});
      }).should.throwError('Async call received result without callId, success flag or result.');
    });

    it('should return immediately if callId does not exist in pendingCalls', function() {
      handler._receiveResult({callId: 9999, result: {test: 'test'}, success: true});

      handler.defaultOnSuccess.calledOnce.should.be.false;
      handler.defaultOnError.calledOnce.should.be.false;
    });

    it('should clear timer for timeout', function() {
      handler.callAsyncOnSharedService('service', 'method', 'args');
      handler._receiveResult({callId: 1, result: {test: 'test'}, success: true});

      clock.tick(handler.defaultMaxResponseTime);
      handler.defaultOnTimeout.called.should.be.false;
    });

    it('should call onSuccess event with response data on successful request', function() {
      handler.callAsyncOnSharedService('service', 'method', 'args');
      handler._receiveResult({callId: 1, result: {test: 'test'}, success: true});

      handler.defaultOnSuccess.calledOnce.should.be.true;
      handler.defaultOnError.calledOnce.should.be.false;

      handler.defaultOnError.calledWithExactly({test: 'test'});
    });

    it('should call onError event with error message if request returned with error', function() {
      handler.callAsyncOnSharedService('service', 'method', 'args');
      handler._receiveResult({callId: 1, exception: 'error message', success: false});

      handler.defaultOnError.calledOnce.should.be.true;
      handler.defaultOnSuccess.calledOnce.should.be.false;

      handler.defaultOnError.calledWithExactly('error message').should.be.true;
    });

    it('should remove call from pendingCalls', function() {
      sinon.spy(handler, '__clearCall');
      handler.callAsyncOnSharedService('service', 'method', 'args');
      handler._receiveResult({callId: 1, result: {test: 'test'}, success: true});
      handler.defaultOnSuccess.calledOnce.should.be.true;

      handler.__clearCall.calledOnce.should.be.true;
    });
  });
});
