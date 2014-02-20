
var sinon = require("sinon");
require("should");

require("../JQoteTemplate");
describe('JQoteTemplate', function(){
  var env = new Consoloid.Test.Environment();

  describe('#get()', function() {

    it('should return existing templates', function() {
      $(document.body).append('<script id="test-tpl-1" type="text/x-jqote-template"><![CDATA[ test-tpl1 ]]></script>');
      var object = env.create(Consoloid.Widget.JQoteTemplate, {
        'id': 'test-tpl-1'
      });
      object.get().should.have.lengthOf(1);
    });

    it('should load templates not present in dom from server', function() {
      var object = env.create(Consoloid.Widget.JQoteTemplate, {
        'id': 'test-tpl-2'
      });

      var mock = sinon.mock(env.container.get('resource_loader'));
      mock.expects("getTemplate")
        .once()
        .withArgs('test-tpl-2')
        .returns('<script id="test-tpl-2" type="text/x-jqote-template"><![CDATA[ test-tpl2 ]]></script>');

      object.get().should.have.lengthOf(1);
      mock.verify();
    });
  });
});
