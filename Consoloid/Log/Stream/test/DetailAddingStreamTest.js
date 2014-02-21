require('../../DetailProvider/BaseProvider');
require('../Stream');
require('../DetailAddingStream');
require('../../../Test/UnitTest');
describeUnitTest('Consoloid.Log.Stream.DetailAddingStream', function() {
  var
    stream,
    nextStream;

  beforeEach(function() {
    nextStream = {
      write: sinon.spy()
    };

    stream = env.create('Consoloid.Log.Stream.DetailAddingStream', {
      nextStream: nextStream
    });
  });

  describe('#__constructor()', function() {
    it('should require nextStream property', function() {
      (function() {
        env.create('Consoloid.Log.Stream.DetailAddingStream', {});
      }).should.throw("nextStream must be injected");
    });
  });

  describe('#addDetailProviderFunction(fn)', function() {
    it('should store the function as detail provider', function() {
      var
        provider1 = sinon.spy(),
        provider2 = sinon.spy();

      stream.addDetailProviderFunction(provider1);
      stream.getDetailProviders().should.eql([ provider1 ]);

      stream.addDetailProviderFunction(provider2);
      stream.getDetailProviders().should.eql([ provider1, provider2 ]);
    });
  });

  describe('#addDetailProviderObject(provider)', function() {
    it('should store provideDetails() method of provider as detail provider function', function() {
      var
        provider1 = env.create('Consoloid.Log.DetailProvider.BaseProvider', {});

      stream.addDetailProviderObject(provider1);
      stream.getDetailProviders().should.eql([ provider1.provideDetails ]);
    });
  });

  describe('#write(data)', function() {
    it('should extend data using the detail providers', function() {
      var provider1 = function(params) {
        return $.extend(params, { foo: 'bar' });
      }

      stream.addDetailProviderFunction(provider1);
      stream.write({ test: 'test' });

      nextStream.write.calledOnce.should.be.true;
      nextStream.write.args[0][0].should.eql({ test: 'test', foo: 'bar' });
    });

    it('should proxy calls to nextStream', function() {
      stream.write('info', 'test', { test: 'test' });

      nextStream.write.calledOnce.should.be.true;
    });
  });
});
