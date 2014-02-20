var should = require("should");
var sinon = require('sinon');

require("../UserMessage");

describe('Consoloid.Error.UserMessage', function(){
  describe('#toString()', function(){
    it('should prefix error message with UserMessage', function(){
      var userMessage = new Consoloid.Error.UserMessage({message:'test message'});
      userMessage.toString().should.equal('UserMessage: test message');
    });
  });
});
