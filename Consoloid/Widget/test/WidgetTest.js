var sinon = require("sinon");
require('../jquery.jqote2.min.js');

require('../Widget.js');
describe('Widget', function() {
  var env = {};

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
  });

  describe('constructor', function() {
    it('sets associated node when id is given', function() {
      $(document.body).append($('<div id="widget-test">foo</div>'));
      var object = env.create(Consoloid.Widget.Widget, {
        id: 'widget-test'
      });

      object.node.should.eql($('#widget-test'));
    });

    it('creates template object when templateId is given', function() {
      var object = env.create(Consoloid.Widget.Widget, {
        templateId: 'widget-test-template'
      });

      object.should.have.property('template');
      object.template.should.have.property('id', 'widget-test-template');
    });
  });

  describe('#render()', function() {
    beforeEach(function() {
      $(document.body).append($('<div id="widget-render-test">foo</div>'));
      $(document.body).append($('<script id="widget-render-test-template" type="text/x-jqote-template">bar</script>'));
      $(document.body).append($('<script id="widget-render-test-template2" type="text/x-jqote-template">\
          <a href="#" class="foo">bar</a>\
          </script>'));
    });

    it('clears node and appends rendered template', function() {
      var object = env.create(Consoloid.Widget.Widget, {
        templateId: 'widget-render-test-template'
      });

      object.setNode($('#widget-render-test'));

      var templateMock = sinon.mock(object.template);
      templateMock.expects('get')
        .once()
        .returns($('#widget-render-test-template'));

      object.render();
      $('#widget-render-test').text().should.equal('bar');

      templateMock.verify();
    });

    it('binds listeners to events', function() {
      var object = env.create(Consoloid.Widget.Widget, {
        id: 'widget-render-test',
        templateId: 'widget-render-test-template2'
      });

      var spy = sinon.spy();
      object.addEventListener('a.foo', 'click', spy);
      object.render();

      $('#widget-render-test a.foo').click();
      spy.calledOnce.should.be.true;
    });
  });

  afterEach(function() {
    $(document.body).empty();
    env.shutdown();
  });
});
