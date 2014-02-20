var
  should = require("should"),
  sinon = require("sinon");

require('../Stream/Stream');
require("../StreamContainer");
describe('Consoloid.Log.StreamContainer', function() {
  var
    env,
    container;

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
    container = env.create('Consoloid.Log.StreamContainer', {});
  });

  describe('#__constructor()', function() {
    it('should add streamServices to the own streams', function() {
      env.addServiceMock('streamService1', env.create('Consoloid.Log.Stream.Stream', {}));
      env.addServiceMock('streamService2', env.create('Consoloid.Log.Stream.Stream', {}));

      container = env.create('Consoloid.Log.StreamContainer', { streamServices:['streamService1', 'streamService2'] });

      container.streams.length.should.be.eql(2);
      container.streams[0].should.be.eql(env.container.get('streamService1'));
      container.streams[1].should.be.eql(env.container.get('streamService2'));
    });
  });

  describe('#addStream(object)', function() {
    it('should throw an exception if the object is not an instance of the Stream class', function() {
      var invalidStream = {};
      (function() { container.addStream(invalidStream) })
        .should.throwError();
    });

    it('should add the object to the own streams', function() {
      var validStream = env.create('Consoloid.Log.Stream.Stream', {});
      container.addStream(validStream);

      container.streams.length.should.be.eql(1);
      container.streams[0].should.be.eql(validStream);
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});