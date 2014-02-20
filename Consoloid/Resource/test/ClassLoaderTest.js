var should = require("should");
var sinon = require("sinon");

require("../ClassLoader.js");
describe('ClassLoader', function() {
  var env;
  beforeEach(function(){
    env = new Consoloid.Test.Environment();
  });
  afterEach(function() {
    env.shutdown();
  });

  describe('loadClass event', function() {
    it('should trigger loading class source from resource_loader', function() {
      var object = env.create(Consoloid.Resource.ClassLoader, {});
      var mock = sinon.mock(env.container.get('resource_loader'));
      mock.expects("getJs")
        .once()
        .withArgs('Test/Service/Container');

      (function() { getClass('Test.Service.Container'); }).should.throw();

      mock.verify();
    });

    it('should load class', function() {
      var object = env.create(Consoloid.Resource.ClassLoader, {});
      var mock = sinon.mock(env.container.get('resource_loader'));
      mock.expects("getJs")
        .once()
        .withArgs('Consoloid/Resource/Test')
        .returns("defineClass('Consoloid.Resource.Test', { test: function() { return 'foo'; } });");

      var test = new (getClass('Consoloid.Resource.Test'))();
      should.equal(test.test(), "foo");

      mock.verify();
    });
  });
});
