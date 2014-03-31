require("should");
require("../ServiceContainer.js");

var Test1 = $.inherit({
  __constructor: function(options)
  {
    this.options = options;
  },
});

describe('ServiceContainer', function(){
  var container;

  beforeEach(function(){
    container = new Consoloid.Service.ServiceContainer();
    container.addDefinition('test1', {
      cls: Test1,
      shared: false,
      options: { option1: 'value1', option2: 'value2' },
      tags: [ 'tag1' ]
    });
    container.addDefinition('test2', {
      cls: Test1,
      shared: true,
      options: { option1: 'value3', option2: 'value4' },
      tags: [ 'tag1' ]
    });

  });

  describe('#addDefinition()', function(){
    it('should store definition', function(){
      container.definitions.should.have.property('test1').property('options');
      container.definitions.test1.options.should.have.property('option1', 'value1');
    });
  });

  describe('#removeDefinition()', function(){
    it('should remove definition', function() {
      container.removeDefinition('test1');
      container.definitions.should.not.have.property('test1');
    });

    it('should also remove shared service instances', function() {
      container.get('test2');
      container.removeDefinition('test2');
      (function() {
        container.get('test2');
      }).should.throwError();
    });
  });

  describe('#get()', function(){
    it('should create every instance as given in definitions', function() {
      var test1 = container.get('test1');
      test1.options.should.have.property('option1', 'value1');
      test1.options.option1 = 'changedValue';
      container.definitions.test1.options.should.have.property('option1', 'value1');
      container.get('test1').options.should.have.property('option1', 'value1');
    });

    it('creates shared services once', function(){
      container.get('test2').options.should.have.property('option1', 'value3');
      container.get('test2').options.option1 = 'changedValue';
      container.get('test2').options.should.have.property('option1', 'changedValue');
    });

    it('should resolve references in options', function() {
      container.addDefinition('test3', {
        cls: Test1,
        shared: false,
        options: { option1: '@test2' },
      });

      container.get('test3').options.should.have.property('option1', container.get('test2'));
    });


    it('should resolve references in suboptions', function() {
      container.addDefinition('test3', {
        cls: Test1,
        shared: false,
        options: {
          option1: {
            option2: '@test2'
          },
        }
      });

      container.get('test3').options.option1.should.have.property('option2', container.get('test2'));
    });

    it('should get the same service from name and alias', function(){
      container.addDefinition('test1', {
        cls: Test1,
        alias: 'Test1Alias'
      });

      var
        service1 = container.get('Test1Alias'),
        service2 = container.get('test1');

        service1.should.be.eql(service2);
    });
  });

  describe('#getAllTagged(tag)', function() {
    it('should return an instance of all service tagged with tag', function() {
      var result = container.getAllTagged('tag1');

      result.should.have.lengthOf(2);
      result[0].options.option1.should.equal('value1');
      result[1].options.option2.should.equal('value4');
    });
  });

  describe('#getAllTagged(tag)', function() {
    it('should return an instance of all service tagged with tag', function() {
      var result = container.getAllTagged('tag1');

      result.should.have.lengthOf(2);
      result[0].options.option1.should.equal('value1');
      result[1].options.option2.should.equal('value4');
    });
  });

  describe('#getAllServiceIdsTagged(tag)', function() {
    it('should return an instance of all service tagged with tag', function() {
      var result = container.getAllServiceIdsTagged('tag1');

      result.should.have.lengthOf(2);
      result[0].should.equal('test1');
      result[1].should.equal('test2');
    });
  });
});
