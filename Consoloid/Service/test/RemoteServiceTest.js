require("../BaseRemoteService.js");
require("../RemoteService.js");
require('../../Test/UnitTest');
describeUnitTest('RemoteService', function(){
  beforeEach(function() {
    env.container.addDefinition('remote_service_1', {
      cls: Consoloid.Service.RemoteService,
      shared: false,
      options: {
        id: 'remote-service-1',
        methods: [
          {
            name: 'method',
          },
          {
            name: 'otherMethod',
          },
        ]
      }
    });
  });

  describe('#__constructor()', function() {
    beforeEach(function() {
      sinon.stub($, 'ajax', function(options){
        options.success({ result: 5 });
      });
    });

    it('should fill server url if not given in options', function() {
      var object = env.container.get('remote_service_1');
      object.should.have.property('__options').with.property('server_url', 'testUrl/m');
    });

    it('should get instance ID by an ajax call', function() {
      var object = env.container.get('remote_service_1');

      var options = $.ajax.args[0][0];
      options.should.have.property('url', 'testUrl/i');
      options.should.have.property('data');
      options.should.have.property('success');
      options.data.should.have.property('id', 'remote-service-1');

      object.__options.instanceID.should.equal(5);
    });

    afterEach(function() {
      $.ajax.restore();
    });
  });

  describe('stubs', function() {
    beforeEach(function() {
      sinon.stub($, 'ajax', function(options){
        options.success({ result: 5 });
      });
    });

    it('should call method on server side', function() {
      var object = env.container.get('remote_service_1');
      object.__options.instanceId = 5;
      object.otherMethod('foo', 'bar');
      $.ajax.calledTwice.should.equal(true);

      var options = $.ajax.args[1][0];
      options.should.have.property('data');
      options.should.have.property('success');

      options.data.should.have.property('instanceId', 5);
      options.data.should.have.property('method', 'otherMethod');
      options.data.should.have.property('arguments');
    });

    it('should have a destroyService method', function() {
      var object = env.container.get('remote_service_1');
      (typeof object.destroyService === 'function').should.be.ok;
    });

    it('should throw an exception if a destroyService method is in the original definition', function() {
      env.container.addDefinition('remote_service_2', {
        cls: Consoloid.Service.RemoteService,
        shared: false,
        options: {
          id: 'remote-service-2',
          methods: [
            {
              name: 'destroyService',
              async: false
            }
          ]
        }
      });

      (function() {
        env.container.get('remote_service_2');
      }).should.throw();
    });

    afterEach(function() {
      $.ajax.restore();
    });
  });

  describe("#__constructor() with unsuccesful ajax", function() {
    it('should throw if no instance_id is returned', function() {
      sinon.stub($, 'ajax');

      (function() {
        var object = env.container.get('remote_service_1');
        $.ajax.args[0][0].success({ });
      }).should.throw();

      $.ajax.restore();
    });
  });

  describe('callAsync(method, args, callbacks, maxResponseTime)', function() {
    beforeEach(function() {
      sinon.stub($, 'ajax', function(options){
        options.success({ result: 5 });
      });
    });

    it('should call given method on server side, using AsyncRPC on client side', function() {
      env.addServiceMock('async_rpc_handler_client', {
        callAsyncOnService: sinon.spy()
      });
      var service = env.container.get('remote_service_1');

      service.callAsync('method', [ 'arg1', 'arg2' ], {}, 5);

      env.container.get('async_rpc_handler_client').callAsyncOnService.calledOnce.should.be.true;
      env.container.get('async_rpc_handler_client').callAsyncOnService.args[0][0].should.equal(5);
      env.container.get('async_rpc_handler_client').callAsyncOnService.args[0][1].should.equal('method');
      env.container.get('async_rpc_handler_client').callAsyncOnService.args[0][2].should.eql(['arg1', 'arg2']);
      env.container.get('async_rpc_handler_client').callAsyncOnService.args[0][6].should.eql(5);
    });

    afterEach(function() {
      $.ajax.restore();
    });
  });
});
