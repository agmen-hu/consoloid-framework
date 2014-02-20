require("should");
var sinon = require("sinon");
require("../ServiceContainer.js");
require("../ChainedContainer.js");

describe('Consoloid.Service.ChainedContainer', function() {
  describe('#get()', function() {
    it('should return service from its own definitions if possible', function() {
      var chainedContainer = new Consoloid.Service.ChainedContainer();
      chainedContainer.addSharedObject('test1', {
        foo: 'bar'
      });

      chainedContainer.get('test1').foo.should.equal('bar');
    });

    it('should return service from fallback container if definition is not available', function() {
      var fallbackContainer = { get: function() { return 'test'; } }
      var chainedContainer = new Consoloid.Service.ChainedContainer({ fallback: fallbackContainer });

      sinon.spy(fallbackContainer, 'get');
      chainedContainer.get('something').should.equal('test');
      fallbackContainer.get.calledOnce.should.be.ok;
    });
  });

  describe('#getDefinition()', function() {
    it('should return service definition from its own definitions if possible', function() {
      var chainedContainer = new Consoloid.Service.ChainedContainer();
      chainedContainer.addDefinition('test1', { foo: 'bar', options: {} });

      chainedContainer.getDefinition('test1').foo.should.equal('bar');
    });

    it('should return service definition from fallback container if definition is not available', function() {
      var fallbackContainer = { getDefinition: function() { return { foo: 'bar', options: {} } } };
      var chainedContainer = new Consoloid.Service.ChainedContainer({ fallback: fallbackContainer });

      sinon.spy(fallbackContainer, 'getDefinition');
      chainedContainer.getDefinition('something').foo.should.equal('bar');
      fallbackContainer.getDefinition.calledOnce.should.be.ok;
    });
  });

  describe('#getAllServiceIdsTagged()', function() {
    it('should return service ids defined in it and also in the fallback container', function() {
      var fallbackContainer = {
        getAllServiceIdsTagged: sinon.stub().returns('test01')
      };

      var chainedContainer = new Consoloid.Service.ChainedContainer({
        fallback: fallbackContainer,
        definitions: {
          test02: {
            cls: 'test02',
            tags: [ 'foo' ]
          }
        }
      });

      chainedContainer.getAllServiceIdsTagged('foo').should.include('test01');
      fallbackContainer.getAllServiceIdsTagged.calledOnce.should.be.true;
      fallbackContainer.getAllServiceIdsTagged.calledWith('foo').should.be.true;
      chainedContainer.getAllServiceIdsTagged('foo').should.include('test02');
    });
  });
});
