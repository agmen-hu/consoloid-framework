require('../BasePeer');
require('../BrowserPeer');
require('../../../Test/UnitTest');
describeUnitTest('Consoloid.Service.AsyncRPC.BrowserPeer', function() {
  var
    handler;

  beforeEach(function() {
    global.io = {
      connect: sinon.stub().returns({
        emit: sinon.spy(),
        on: sinon.spy()
      })
    };

    env.addServiceMock('resource_loader', { getJs: function() { return ''; } });
    env.addServiceMock('server', { url: 'host' });

    defineClass('Consoloid.Service.AsyncRPC.TestedBrowserPeer', 'Consoloid.Service.AsyncRPC.BrowserPeer', {
      _setupListeners: sinon.spy(),
      __getSessionId: sinon.stub().returns('testSessionId')
    });
    handler = env.create('Consoloid.Service.AsyncRPC.TestedBrowserPeer', {});
  });

  describe('#__construct()', function() {
    it('should setup socket connection', function() {
      io.connect.calledOnce.should.be.true;
      io.connect.calledWithExactly('host').should.be.true;
    });

    it('should register the session on the server side', function() {
      handler.getSocket().emit.calledOnce.should.be.true;
      handler.getSocket().emit.args[0][0].should.be.equal('connect.register');
      handler.getSocket().emit.args[0][1].should.be.eql({ sessionID: 'testSessionId' });
    });

    it('should bind events by calling _setupListeners()', function() {
      handler._setupListeners.calledOnce.should.be.true;
    });
  });

  describe("_handleSharedServiceCallRequest(req)", function() {
    var
      service,
      response

    beforeEach(function() {
      service = {
        method: sinon.mock()
      }
      env.addServiceMock('service', service);

      response = {
        sendResult: sinon.stub(),
        sendError: sinon.stub()
      }

      handler.create = sinon.stub();
      handler.create.withArgs("Consoloid.Service.AsyncRPC.Response").returns(response);

      handler._handleSharedServiceCallRequest({
        callId: 1,
        service: 'service',
        method: 'method',
        args: ['test']
      });
    });

    it("should wrap a callback for the responding service method", function() {
      service.method.calledOnce.should.be.true;
      service.method.args[0][1].should.equal('test');
      (typeof service.method.args[0][0] == "function").should.be.true;
      service.method.args[0][0](null, "foobar");

      response.sendResult.calledOnce.should.be.ok;
      response.sendResult.args[0][0].should.equal("foobar");
    });

    it("should wrap a callback that deals with errors too", function() {
      service.method.args[0][0]("foobar");

      response.sendError.calledOnce.should.be.ok;
      response.sendError.args[0][0].should.equal("foobar");
    });
  });
});
