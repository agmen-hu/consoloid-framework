var
  should = require("should"),
  sinon = require("sinon");

require("../Stream/Stream");
require("../StreamContainer");
require("../BaseLogger");
describe('Consoloid.Log.BaseLogger', function() {
  var
    env,
    logger;

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
    logger = env.create('Consoloid.Log.BaseLogger', {});
  });

  describe('#setLevelByName(levelName)', function(){
    it('should not throw an error if the given level exists', function(){
      logger.setLevelByName('info');
    });

    it('should throw an error if the given level does not exist', function(){
      (function(){ logger.setLevelByName('unknown') }).should.throw();
    });
  });

  describe('#log(level, parameter)', function() {
    var
      stream1,
      stream2,
      clock;

    beforeEach(function(){
      stream1 = env.create('Consoloid.Log.Stream.Stream', {});
      sinon.stub(stream1, 'write');
      stream2 = env.create('Consoloid.Log.Stream.Stream', {});
      sinon.stub(stream2, 'write');

      logger.addStream(stream1);
      logger.addStream(stream2);

      clock = sinon.useFakeTimers(12345)
    });

    function checkStreams(object)
    {
      stream1.write.calledOnce.should.be.true;
      stream1.write.firstCall.args[0].should.be.eql(object);

      stream2.write.calledOnce.should.be.true;
      stream2.write.firstCall.args[0].should.be.eql(object);
    }

    it('should call all stream write method, with the correct arguments', function(){
      logger.log('info', 'log info', {foo: 'bar'});

      checkStreams({ t:12345, l: 'info', m:'log info', p: { foo:'bar' }});
    });

    it('should call the bachend write method if the level is equal or greater then logger level', function(){
      logger.setLevelByName('error');

      logger.log('info', 'log info', {foo: 'bar'});
      logger.log('error', 'log error');

      checkStreams({ t:12345, l: 'error', m:'log error', p: {}});
    });

    afterEach(function(){
      clock.reset();
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
