require("../BaseRemoteService.js");
require('../../Test/UnitTest');
describeUnitTest('BaseRemoteService', function(){
  beforeEach(function() {
    env.container.addDefinition('remote_service_1', {
      cls: Consoloid.Service.BaseRemoteService,
      shared: false,
      options: {
        id: 'remote-service-1',
        methods: [
          {
            name: 'method'
          },
          {
            name: 'otherMethod'
          },
        ]
      }
    });
  });

  describe('constructor', function() {
    it('should create stubs for each method given in options', function() {

      var object = env.container.get('remote_service_1');
      object.should.have.property('method');
      object.should.have.property('otherMethod');
    });
  });

  describe('stub', function() {
    beforeEach(function() {
      sinon.stub($, 'ajax', function(options) {
        options.should.have.property('data');
        options.data.should.have.property('id', 'remote-service-1');
        options.data.should.have.property('method', 'otherMethod');
        options.data.should.have.property('arguments');
        options.data.arguments.should.have.property('0', 'foo');
        options.data.arguments.should.have.property('1', 'bar');
      });
    });

    it('should call method synchronously on server side', function() {
      var object = env.container.get('remote_service_1');
      object.otherMethod('foo', 'bar');
      $.ajax.calledOnce.should.equal(true);
    });

    afterEach(function() {
      $.ajax.restore();
    });
  });
});
