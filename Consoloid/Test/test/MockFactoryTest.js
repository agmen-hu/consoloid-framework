require("../MockFactory");

require("../UnitTest");
describeUnitTest('Consoloid.Test.MockFactory', function() {
  var factory;

  describe('#create(cls)', function(){
    beforeEach(function(){
      factory = env.create('Consoloid.Test.MockFactory', {sinon: sinon});
    });

    it('should create stub for own method', function(){
      var spied = factory.create('Consoloid.Test.MockFactory');
      spied.create.returns('foo');
      spied.create().should.be.equal('foo');

      spied.create.calledOnce.should.be.true;
    });

    it('should preserve the inherit chain', function(){
      var spied = factory.create('Consoloid.Test.MockFactory');
      spied.should.be.an.instanceOf(Consoloid.Test.MockFactory);
      spied.should.be.an.instanceOf(Consoloid.Base.Object);
    });
  });
});
