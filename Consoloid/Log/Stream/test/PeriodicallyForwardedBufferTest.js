var
  should = require("should"),
  sinon = require("sinon");

require("../Stream");
require("../PeriodicallyForwardedBuffer");
describe('Consoloid.Log.Stream.PeriodicallyForwardedBuffer', function() {
  var
    env,
    clock,
    stream;

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
    clock = sinon.useFakeTimers();
    stream = env.create('Consoloid.Log.Stream.PeriodicallyForwardedBuffer', {interval: 1000});
  });

  describe('#write(object)', function(){
    it('should store to the memory', function(){
      stream.write({foo: 'bar'});
      stream.buffer.length.should.be.eql(1);
      stream.buffer[0].should.be.eql({foo:'bar'});

      stream.write({bar: 'foo'});
      stream.buffer.length.should.be.eql(2);
      stream.buffer[1].should.be.eql({bar: 'foo'});
    });
  });

  describe('Forward interval functionality', function(){
    beforeEach(function(){
      sinon.stub(stream, '_forward', function(){});
    });

    it('should start and stop calling _forward method', function(){
      stream._scheduleForward();
      stream._forward.called.should.be.false;

      clock.tick(2000);
      stream._forward.calledTwice.should.be.true;

      stream._unScheduleForward();

      clock.tick(1000);
      stream._forward.calledThrice.should.be.false;
    })

    afterEach(function(){
      stream._unScheduleForward();
    });
  });

  afterEach(function() {
    clock.restore();
    env.shutdown();
  });
});