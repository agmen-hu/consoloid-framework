require('../../Service/ClientSideContainer');
require('../../Resource/ClassLoader');
require('../../Resource/TopicLoader');
require('../../Error/Handler');
require('../Application');

require('../../Test/UnitTest');
describeUnitTest('Application', function() {
  var env;
  beforeEach(function(){
    env = new Consoloid.Test.Environment();
  });
  afterEach(function() {
    env.shutdown();
  });

  describe('constructor', function() {
    it('should throw exception when server url is missing from options', function() {
      (function() { env.create(Consoloid.Application.Application, {}); }).should.throw();
    });

    it('should create shared objects given in argument', function() {
      var object = env.create(Consoloid.Application.Application, {
        server: {
          url: 'testUrl',
        },
        foo: 'bar',
      });

      object.get('foo').should.equal('bar');
    });

    it('should create definition of class_loader and topic_loader', function() {
      var object = env.create(Consoloid.Application.Application, {
        server: {
          url: 'testUrl',
        }
      });

      object.container.definitions.should.have.property('class_loader');
      object.container.definitions.should.have.property('topic_loader');
    });
  });

  describe('#loadTopics()', function() {

    it('should create the shared instance of class_loader service', function() {
      var object = new Consoloid.Application.Application({
        server: {
          url: 'testUrl',
        },
      });

      object.container.services.topic_loader = { loadTopics: function() { } };
      var stub = sinon.stub(object.container.services.topic_loader, 'loadTopics');

      object.loadTopics();
      object.container.services.should.have.property('class_loader');
      stub.calledOnce.should.be.equal(true);
    });

    it('should load topics given in argument', function() {
      var object = new Consoloid.Application.Application({
        server: {
          url: 'testUrl',
        },
      });

      object.container.services.topic_loader = { loadTopics: function() { } };
      var stub = sinon.stub(object.container.services.topic_loader, 'loadTopics');

      object.loadTopics(['test1', 'test2']);
      stub.calledOnce.should.be.equal(true);
      stub.calledWith(['test1', 'test2']);
    });
  });
});
