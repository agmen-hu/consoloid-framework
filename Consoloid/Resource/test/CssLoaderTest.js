var should = require("should");
var sinon = require("sinon");

require("../CssLoader.js");
describe('CssLoader', function() {
  var env = new Consoloid.Test.Environment();

  describe('load', function() {
    var object = env.create(Consoloid.Resource.CssLoader, {});

    it('should not load css already loaded', function() {
      $('head').append(
        '<style id="test-css" type="text/css">body.test: { color: red; }</style>'
      );

      var spy = sinon.spy($.fn, 'append');
      object.load('test-css');
      spy.calledOnce.should.be.false;
      $.fn.append.restore();
    });

    it('should load css', function() {
      object.load('second-test-css');
      $('head').find('#second-test-css').length.should.be.equal(1);
    });
  });
});