require('../BaseProvider');
require('../StaticDetail');
require('../../../Test/UnitTest');
describeUnitTest('Consoloid.Log.DetailProvider.StaticDetail', function() {
  var
    provider;

  beforeEach(function() {
    provider = env.create('Consoloid.Log.DetailProvider.StaticDetail', {
      details: {
        session: 'id',
        variant: 'A'
      }
    });
  });

  describe('#__constructor()', function() {
    it('should require details property', function() {
      (function() {
        env.create('Consoloid.Log.DetailProvider.StaticDetail', {});
      }).should.throw("details must be injected");
    });
  });

  describe('#provideDetails(data)', function() {
    it('should add data in details to p property of data', function() {
      provider.provideDetails({ foo: 'bar' }).should.eql({ foo: 'bar', p: { session: 'id', variant: 'A' }});
    });
  })
});
