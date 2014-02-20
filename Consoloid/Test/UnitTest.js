global.should = require("should"),
global.sinon = require("sinon");

global.describeUnitTest = function(name, fn, cls) {
  describe(name, function() {
    beforeEach(function() {
      global.env = new (cls || Consoloid.Test.Environment)();
    });

    fn();

    afterEach(function() {
      global.env.shutdown();
    });
  });
};