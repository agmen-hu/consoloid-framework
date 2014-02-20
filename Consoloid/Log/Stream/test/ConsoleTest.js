var
  should = require("should"),
  sinon = require("sinon");

require("../Stream");
require("../Console");

describe('Consoloid.Log.Stream.Console', function() {
  var
    env,
    clock,
    stream;

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
    clock = sinon.useFakeTimers();
    stream = env.create('Consoloid.Log.Stream.Console', {});
    env.mockConsoleLog();
  });

  describe('#write(object)', function(){
    it('should call the console log method', function() {
      sinon.spy(console, 'log');

      stream.write({l:'logLevel', t: 1000, m: 'message', p:{foo: 'bar'}});

      console.log.calledOnce.should.be.true;
      console.log.calledWith(new Date(1000).toLocaleString() + ' log: message', {foo: 'bar'});
    })

    it('should throw exception for wrong log object', function() {
      (function(){ stream.write({l:'', t: 1000, m: 'message', p:{foo: 'bar'}}) })
        .should.throwError();

      (function(){ stream.write({l:'logLevel', t: '10.10.2010 10:10', m: 'message', p:{foo: 'bar'}}) })
        .should.throwError();

      (function(){ stream.write({l:'logLevel', t: 1000, m: '', p:{foo: 'bar'}}) })
        .should.throwError();

      (function(){ stream.write({l:'logLevel', t: 1000, m: 'message', p:'bar'}) })
      .should.throwError();
    });
  });

  afterEach(function(){
    env.unmockConsoleLog();
    clock.reset();
    env.shutdown();
  });
});