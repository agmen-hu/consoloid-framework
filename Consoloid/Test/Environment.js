(function() {
  var jsdom = require("jsdom").jsdom;
  global.document = jsdom("<html><head></head><body></body></html>");
  global.window = document.createWindow();
  global.jQuery = global.$ = require('jquery');;

  global.navigator = { userAgent: ''};
  require('../Base/jquery/jquery.inherit.min.js');
  require('../Base/Object');
  require("../Service/ServiceContainer");
  require("./FakeResourceLoader");
  require("./MockFactory");

  global.jQuery.ready();
}());

var fs = require("fs");

/**
 * Provides environment for running tests.
 *
 * @class Environment
 * @namespace Consoloid.Test
 */
defineClass('Consoloid.Test.Environment', 'Consoloid.Base.Object',
  {
    __constructor: function()
    {
      $.fx.off = true;
      this.initializeContainer();
      this.consoleLog = undefined;
      this.consoleDir = undefined;
      this.mockFactory = new Consoloid.Test.MockFactory({sinon: require('sinon') });
    },

    /**
     * Initializes the service container in the environment.
     *
     * @returns Consoloid.Test.Environment Self.
     */
    initializeContainer: function()
    {
      this.container = new Consoloid.Service.ServiceContainer();
      this.addServiceMock('server', { url: 'testUrl' });
      this.addServiceMock('resource_loader', new Consoloid.Test.FakeResourceLoader({
        container: this.container
      }));

      this.addServiceMock('logger', { log: function() {} });

      return this;
    },

    /**
     * Add a service mock to the service container in the environment.
     *
     * The mock will be added as a shared object.
     *
     * @param name Name of the service.
     * @param object Object that provides the service.
     * @returns Consoloid.Test.Environment Self.
     */
    addServiceMock: function(name, object)
    {
      this.container.addSharedObject(name, object);
      return this;
    },

    /**
     * Create a new object with container passed in options.
     *
     * @param cls string|object Class of the new object. Can be given as string.
     * @param options object Options passed to the constructor of cls.
     *                        The container property will be the service container of
     *                        the environment.
     * @returns object The created object.
     */
    create: function(cls, options)
    {
      options['container'] = this.container;
      return this.__base(cls, options);
    },

    mock: function(cls)
    {
      return this.mockFactory.create(cls);
    },

    /**
     * Shutdown test environment.
     *
     * Some event listeners prevent deleting the service container when the environment is
     * deleted. This function ensures that the enviroment will be deleted when the testcase
     * loses all references to it.
     */
    shutdown: function() {
      $('body').unbind();
      $('html').unbind();
      $(document).unbind();
      document.body.innerHTML = '';
      $.fx.off = false;
    },

    /**
     * Reads template file into dom.
     *
     * @param filename string Name of file.
     */
    readTemplate: function(filename)
    {
      $(document.body).append(fs.readFileSync(filename, 'utf8'));
    },

    mockConsoleLog: function()
    {
      if (!this.consoleLog) {
        this.consoleLog = console.log;
        console.log = function() {};
      }
    },

    unmockConsoleLog: function()
    {
      if (this.consoleLog) {
        console.log = this.consoleLog;
        this.consoleLog = undefined;
      }
    },

    mockConsoleDir: function()
    {
      if (!this.consoleDir) {
        this.consoleDir = console.dir;
        console.dir = function() {};
      }
    },

    unmockConsoleDir: function()
    {
      if (this.consoleDir) {
        console.dir = this.consoleDir;
        this.consoleDir = undefined;
      }
    }
  }
);
