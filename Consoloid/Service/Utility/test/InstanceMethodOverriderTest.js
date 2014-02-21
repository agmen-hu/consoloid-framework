require('../InstanceMethodOverrider');
require('../../../Test/UnitTest');

describeUnitTest('Consoloid.Service.Utility.InstanceMethodOverrider', function() {
  var
    object,
    service,
    overrider;

  describe('#override(obj, methodName, config)', function(){
    beforeEach(function(){
      overrider = env.create('Consoloid.Service.Utility.InstanceMethodOverrider', {});
      object = {
        method: function() { return false; }
      }
    });

    it('should do nothing when config is falsy', function(){
      overrider.override(object, 'method');
      object.method().should.be.false;

      overrider.override(object, 'method', {});
      object.method().should.be.false;
    });

    it('should throw error when config does not have service or method parameter', function(){
      (function(){ overrider.override(object, 'method', {service: 1}); }).should.throw('Method overrider does not get either service or method name');
      (function(){ overrider.override(object, 'method', {method: 1}); }).should.throw('Method overrider does not get either service or method name');
    });

    describe('method got a valid service config', function(){
      beforeEach(function(){
        service = {
          invalid: true,
          targetMethod: function() { return true; }
        }

        env.addServiceMock('service', service);
      });

      it('should throw when configured property is not a function', function(){
        (function(){ overrider.override(object, 'method', {service: 'service', method: 'invalid'}); })
          .should.throw('Method overrider does not has the given method');
      });

      it('should override the configured method', function(){
        overrider.override(object, 'method', {service: 'service', method: 'targetMethod'});
        object.method().should.be.true;
      });

      it('should passthrough the arguments', function(){
        service.targetMethod = function(shouldCall, what) {
          if (shouldCall) {
            what();
          }
        }

        var spy = sinon.spy();
        overrider.override(object, 'method', {service: 'service', method: 'targetMethod'});
        object.method(true, spy);
        spy.called.should.be.true;
      });

      it('should throw when config has options and service does not has definition', function(){
        (function(){ overrider.override(object, 'method', {service: 'service', method: 'targetMethod', options: {} }); })
        .should.throw('Method overrider got an options and shared serivce');
      });

      it('should not throw when config has options and service is not shared', function(){
        env.container.addDefinition('service', {shared: false});
        overrider.override(object, 'method', {service: 'service', method: 'targetMethod', options: {} });
      });

      it('service has definition and it is shared', function(){
        env.container.addDefinition('service', {shared: true});

        (function(){ overrider.override(object, 'method', {service: 'service', method: 'targetMethod', options: {} }); })
        .should.throw('Method overrider got an options and shared serivce');
      });

      it('should call setter for all option property on the service', function(){
        env.container.addDefinition('service', {shared: false});
        service.setProp = sinon.spy();
        overrider.override(object, 'method', {service: 'service', method: 'targetMethod', options: {prop: 'foo' }});
        service.setProp.calledWith('foo').should.be.true;
      });
    });
  });
});
