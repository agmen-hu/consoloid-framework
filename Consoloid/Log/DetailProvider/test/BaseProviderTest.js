require('../BaseProvider');
require('../../../Test/UnitTest');
describeUnitTest('Consoloid.Log.DetailProvider.BaseProvider', function() {
  describe('#__constructor()', function() {
    it('should bind provideDetails() method to the instance', function() {
      defineClass('Consoloid.Log.DetailProvider.Test.BaseProviderTest', 'Consoloid.Log.DetailProvider.BaseProvider',
        {
          __constructor: function(options)
          {
            this.__base(options);
            this.foo = 'bar';
          },

          provideDetails: function(parameters)
          {
            return this.foo;
          }
        }
      );

      var provider = env.create('Consoloid.Log.DetailProvider.Test.BaseProviderTest', {});
      provider.provideDetails.apply(this, {}).should.equal('bar');
    });

    it('should autoadd itself to the given stream', function() {
      var stream = {
        addDetailProviderObject: sinon.spy()
      };

      var provider = env.create('Consoloid.Log.DetailProvider.Test.BaseProviderTest', {
        autoaddToStream: stream
      });

      stream.addDetailProviderObject.calledOnce.should.be.true;
      stream.addDetailProviderObject.args[0][0].should.equal(provider);
    });
  });
});
