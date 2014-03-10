require("should");
var sinon = require("sinon");
require("../BaseRemoteService.js");
require("../RemoteSharedService.js");

describe('RemoteSharedService', function(){
  var env = new Consoloid.Test.Environment();

  env.container.addDefinition('remote_service_1', {
    cls: Consoloid.Service.RemoteSharedService,
    shared: false,
    options: {
      id: 'remote-service-1',
      methods: [
        {
          name: 'method',
          async: false
        },
        {
          name: 'otherMethod',
          async: false
        },
      ]
    }
  });

  describe('constructor', function() {
    it('should fill server url if not given in options', function() {
      var object = env.container.get('remote_service_1');
      object.should.have.property('__options').with.property('server_url', 'testUrl/c');
    });
  });

  describe('callAsync(method, args, callbacks, maxResponseTime)', function() {
    it('should call given method on server side, using AsyncRPC on client side', function() {
      env.addServiceMock('async_rpc_handler_client', {
        callAsyncOnSharedService: sinon.spy()
      });
      var service = env.container.get('remote_service_1');

      service.callAsync('method', [ 'arg1', 'arg2' ], {}, 5);

      env.container.get('async_rpc_handler_client').callAsyncOnSharedService.calledOnce.should.be.true;
      env.container.get('async_rpc_handler_client').callAsyncOnSharedService.args[0][0].should.equal('remote-service-1');
      env.container.get('async_rpc_handler_client').callAsyncOnSharedService.args[0][1].should.equal('method');
      env.container.get('async_rpc_handler_client').callAsyncOnSharedService.args[0][2].should.eql(['arg1', 'arg2']);
      env.container.get('async_rpc_handler_client').callAsyncOnSharedService.args[0][6].should.eql(5);
    });
  });
});
