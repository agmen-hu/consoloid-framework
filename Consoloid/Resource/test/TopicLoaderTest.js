var should = require("should");
var sinon = require("sinon");

require("../TopicLoader.js");
describe('TopicLoader', function() {
  var env = new Consoloid.Test.Environment();

  describe('loadTopics', function() {
    var object = env.create(Consoloid.Resource.TopicLoader, {});

    it('should load framework topic by default', function() {
      var mock = sinon.mock(object, "loadTopic");
      mock.expects("loadTopic")
        .once()
        .withArgs('framework');

      object.loadTopics();

      mock.verify();
    });

    it('should load given topics one-by-one', function() {
      var mock = sinon.mock(object, "loadTopic");
      var expectation = mock.expects("loadTopic")
        .twice();

      object.loadTopics(['test1', 'test2']);

      expectation.firstCall.args[0].should.equal('test1');
      expectation.secondCall.args[0].should.equal('test2');
      mock.verify();
    });
  });

  describe('loadTopic', function() {
    var object = env.create(Consoloid.Resource.TopicLoader, {});

    it('should retrieve definitions from server', function() {
      var mock = sinon.mock(env.container.get('resource_loader'));
      mock.expects("getDefinitions")
        .once()
        .withArgs('testTopic')
        .returns({});

      object.loadTopics(['testTopic']);

      mock.verify();
    });

    it('should add definitions to container', function() {
      var mock = sinon.mock(env.container.get('resource_loader'));
      mock.expects("getDefinitions")
        .once()
        .withArgs('testTopic')
        .returns({ topic_loader_test: { cls: Consoloid.Base.Object, shared: false, options: {} }});

      var spy = sinon.spy(env.container, "addDefinitions");

      env.container.definitions.should.not.have.property('topic_loader_test');

      object.loadTopics(['testTopic']);

      spy.calledOnce.should.equal(true);
      env.container.definitions.should.have.property('topic_loader_test');
      mock.verify();
    });
  });
});
