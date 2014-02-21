require('../../Test/UnitTest');
describeUnitTest('Consoloid.Base.Object', function() {
  var
    object;

  describe('#constructor(options, instancePolicy)', function(){
    it('should extend itself with options', function(){
      object = new Consoloid.Base.Object({ foo: { bar: true}});

      object.should.have.property('foo');
      object.foo.should.have.property('bar');
      object.foo.bar.should.be.true;
    });

    it('should throw when the options try to override an own method', function(){
      (function(){ new Consoloid.Base.Object({ get: function(){} }); }).should.throw('Method get cannot be overrided');
    });

    describe('method override allowed by explicitly with instancePolicy', function(){
      it('should override method when options has a function type property', function(){
        object = new Consoloid.Base.Object({ get: function(){ return 'foo';} }, { overridableMethods: ['get']});

        object.get().should.be.eql('foo');
      });

      it('should throw when container is not exists or not has instance_method_overrider service', function(){
        (function(){ new Consoloid.Base.Object({ get: { service: 'mock', method: 'mockMethod'}}, { overridableMethods: ['get']}) })
          .should.throw('For method overriding use of instance_method_overrider service is required');
      });

      it('should call MethodOverriderToServiceMethod when options has configured method override', function(){
        var
          methodOverrider = {
            override: sinon.spy()
          },
          getMethodConfig = { service: 'mock', method: 'mockMethod'};

        env.addServiceMock('instance_method_overrider', methodOverrider);

        object = new Consoloid.Base.Object({ get: getMethodConfig, container: env.container}, { overridableMethods: ['get']});

        methodOverrider.override.alwaysCalledWith(object, 'get', getMethodConfig).should.be.true;
      });
    });
  });
});
