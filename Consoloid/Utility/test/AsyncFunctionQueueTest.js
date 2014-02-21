require('../../Test/UnitTest');
require('../AsyncFunctionQueue');

describeUnitTest('Consoloid.Utility.AsyncFunctionQueue', function() {
  var
    callback,
    methodQueue,
    queue,
    async,
    task,
    resourceLoader;

  beforeEach(function() {
    queue = {
      push: sinon.stub(),
      kill: sinon.stub()
    }
    async = {
      queue: sinon.stub().returns(queue)
    }

    task = {
      func: sinon.stub(),
      options: { foo: 'bar' }
    }
    callback = sinon.stub();
  });

  describe("#__constructor(options)", function() {
    it("should require async.js on server side", function() {
      methodQueue = env.create('Consoloid.Utility.AsyncFunctionQueue', {});
      methodQueue.async.should.be.ok;
    });

    it("should aquire async.js on client side from resource loader", function() {
      global.async = undefined;
      env.addServiceMock('application', {});
      resourceLoader = {
        getJs: sinon.stub().returns("async = { queue: sinon.stub() };")
      }
      env.addServiceMock('resource_loader', resourceLoader)

      methodQueue = env.create('Consoloid.Utility.AsyncFunctionQueue', {});

      resourceLoader.getJs.calledOnce.should.be.ok;
      resourceLoader.getJs.args[0][0].should.equal('node_modules/async/lib/async');

      methodQueue.async.should.be.ok;
    });

    it("should create an asnyc.js queue that runs the tasks added to it", function() {
      methodQueue = env.create('Consoloid.Utility.AsyncFunctionQueue', { async: async });
      async.queue.calledOnce.should.be.ok;
      async.queue.args[0][1].should.equal(1);

      async.queue.args[0][0](task, callback);

      task.func.calledOnce.should.be.ok;
      task.func.args[0][0].should.equal(callback);
      task.func.args[0][1].foo.should.equal('bar');
    });
  });

  describe("#setDrain(func)", function() {
    it("should add optional drain function to the queue", function() {
      methodQueue = env.create('Consoloid.Utility.AsyncFunctionQueue', { async: async });
      methodQueue.setDrain(callback);
      queue.drain.should.equal(callback);
    });

    it("should return with itself", function() {
      var result = methodQueue.setDrain(callback);
      result.should.equal(methodQueue);
    });
  });

  describe("#killQueue()", function() {
    it("should empty the tasks array of the queue, and remore the drain function", function() {
      methodQueue = env.create('Consoloid.Utility.AsyncFunctionQueue', { async: async });
      methodQueue.killQueue();
      queue.kill.calledOnce.should.be.ok;
    });
  });

  describe("#add(callback, func, options)", function() {
    it("should push the task to the queue", function() {
      methodQueue = env.create('Consoloid.Utility.AsyncFunctionQueue', { async: async });
      methodQueue.add(callback, sinon.stub(), { foo: "bar" });

      queue.push.calledOnce.should.be.ok;
      queue.push.args[0][0].func.should.be.ok;
      queue.push.args[0][0].options.foo.should.equal("bar");
    });

    it("should return with itself", function() {
      var result = methodQueue.add(callback, sinon.stub(), { foo: "bar" });
      result.should.equal(methodQueue);
    });
  });
});
