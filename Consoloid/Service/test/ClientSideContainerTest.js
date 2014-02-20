var should = require("should");
var sinon = require("sinon");
require("../BaseRemoteService");
require("../RemoteService");
require("../RemoteSharedService");
require("../ClientSideContainer");

describe('ClientSideContainer', function() {
  describe('#__constructor()', function() {
    it('should throw exception when server url is not given', function() {
      (function() { new Consoloid.Service.ClientSideContainer(); }).should.throw();
    });

    before(function() {
      sinon.stub($, 'ajax', function(options) {
        options.should.have.property('data');
        options.should.have.property('success');
        options.data.should.have.property('retrieveAll', true);
        options.success({ definitions: { test_def_1: { cls: 'Test1' }} });
      });
    });

    it('should preload all definitions when configured so', function() {
      var object = new Consoloid.Service.ClientSideContainer({
        server_url: 'test',
        preload_definitions: true,
      });

      $.ajax.calledOnce.should.equal(true);
      object.definitions.should.have.property('test_def_1');
    });

    after(function() {
      $.ajax.restore();
    });
  });

  describe('#get()', function() {

    it('should try to retrieve and use definitions from server', function() {
      sinon.stub($, 'ajax', function(options) {
        options.should.have.property('data');
        options.should.have.property('success');
        options.data.should.have.property('service', 'remote_service_1');
        options.success({
          _success: true,
          definition: {
            id: 'remote-service-1',
            shared: true,
            server_url: 'test',
            methods: [
              {
                name: 'method',
                async: false
              },
              {
                name: 'otherMethod',
                async: false
              },
            ]
          }
        });
      });

      var object = new Consoloid.Service.ClientSideContainer({
        server_url: 'test'
      });

      object.get('remote_service_1');
      $.ajax.calledOnce.should.equal(true);
    });

    it('should try to retrieve and use definitions from server with not shared service', function() {
      var firstAjaxCall = function(options) {
        options.should.have.property('data');
        options.should.have.property('success');
        options.data.should.have.property('service', 'remote_service_1');
        options.success({
          _success: true,
          definition: {
            id: 'remote-service-1',
            shared: false,
            server_url: 'test',
            server_create_instance_url: 'test',
            methods: [
              {
                name: 'method',
                async: false
              },
              {
                name: 'otherMethod',
                async: false
              },
            ]
          }
        });
      };

      var secondAjaxCall = function(options) {
        options.success({result: 5});
      }

      sinon.stub($, 'ajax', function(options){
        if ($.ajax.calledOnce) {
          firstAjaxCall(options);
        } else {
          secondAjaxCall(options);
        }
      })

      var object = new Consoloid.Service.ClientSideContainer({
        server_url: 'test'
      });

      object.get('remote_service_1');
      $.ajax.calledTwice.should.equal(true);
    });

    it('should throw exception when unable to retrieve the definition', function() {
      sinon.stub($, 'ajax', function(options) {
        options.should.have.property('data');
        options.should.have.property('success');
        options.data.should.have.property('service', 'remote_service_1');
        options.success({});
      });

      var object = new Consoloid.Service.ClientSideContainer({
        server_url: 'test'
      });

      (function() { object.get('remote_service_1'); }).should.throw();
    });

    afterEach(function() {
      $.ajax.restore();
    });
  });
});
