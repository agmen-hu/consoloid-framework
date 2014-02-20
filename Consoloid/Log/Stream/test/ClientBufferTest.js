var
  should = require("should"),
  sinon = require("sinon");

require("../Stream");
require("../PeriodicallyForwardedBuffer");
require("../ClientBuffer");
describe('Consoloid.Log.Stream.ClientBuffer', function() {
  var
    env,
    interval,
    maxAttemptTime,
    maxPacketLength,
    stream;

  function createFailingAjaxCall()
  {
    sinon.stub($, 'ajax', function(options){
      options.error();
    });
  }

  function createSuccessfulAjaxCall()
  {
    sinon.stub($, 'ajax', function(options){
      options.success();
    });
  }

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
    interval = 1000;
    maxAttemptTime = 5000;
    maxPacketLength = 5;
    stream = env.create('Consoloid.Log.Stream.ClientBuffer', {
        interval: interval,
        server_url: 'foo',
        maxAttemptTime: maxAttemptTime,
        maxPacketLength: maxPacketLength
      });
    sinon.spy(stream, '__resetPacket');
    sinon.spy(stream, '__packetError');
    sinon.spy(stream, '__postData');
    var logger = {log: function(){}};
    sinon.spy(logger, 'log');
    env.addServiceMock('logger', logger);
  });

  describe('#_forward()', function(){
    it('should return on empty buffer and packet', function(){
      createFailingAjaxCall();
      stream._forward();

      stream.buffer.length.should.be.eql(0);
      stream.packet.length.should.be.eql(0);
      stream.forwardInProgress.should.be.eql(false);
      stream.forwardAttempts.should.be.eql(0);

      stream.__postData.calledOnce.should.be.false;
    });

    it('should not clear the packet on failing request', function(){
      createFailingAjaxCall();

      stream.write({foo1:'bar1'});
      stream.write({foo2:'bar2'});
      stream.buffer.length.should.be.eql(2);

      stream._forward();

      stream.buffer.length.should.be.eql(0);
      stream.packet.length.should.be.eql(2);

      $.ajax.calledOnce.should.be.true;
      stream.__packetError.called.should.be.true;
      stream.__resetPacket.called.should.be.false;
    });

    it('should fill packet but not exceed max length', function(){
      createFailingAjaxCall();

      for(var i = 0; i < maxPacketLength + 1; i++) {
        stream.write({foo:'bar'});
      }
      stream._forward();

      stream.buffer.length.should.be.eql(1);
      stream.packet.length.should.be.eql(maxPacketLength);
    });

    it('should clear the buffer and reset forward data on successful request', function(){
      createSuccessfulAjaxCall();

      stream.write({foo1:'bar1'});
      stream.write({foo2:'bar2'});
      stream.buffer.length.should.be.eql(2);

      stream._forward();

      stream.buffer.length.should.be.eql(0);
      stream.packet.length.should.be.eql(0);
      stream.forwardInProgress.should.be.eql(false);
      stream.forwardAttempts.should.be.eql(0);

      $.ajax.calledOnce.should.be.true;
      stream.__resetPacket.called.should.be.true;
      stream.__packetError.called.should.be.false;
    });

    it('should drop the packet on timeout', function(){
      createFailingAjaxCall();

      stream.write({foo1:'bar1'});
      stream.write({foo2:'bar2'});
      stream.buffer.length.should.be.eql(2);

      for(var i = 0; i < Math.ceil(maxAttemptTime/interval); i++) {
        stream._forward();
      }
      stream.__resetPacket.calledOnce.should.be.false;

      stream._forward();
      stream.__resetPacket.calledOnce.should.be.true;
    });

    afterEach(function(){
      $.ajax.restore();
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});