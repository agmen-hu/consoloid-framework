var
  should = require("should"),
  sinon = require("sinon");

require("../DeepAssoc.js");
describe('Consoloid.Base.DeepAssoc', function() {
  var
    env,
    assoc;

  beforeEach(function() {
    env = new Consoloid.Test.Environment();
  });

  describe('#constructor()', function() {
    it('should accept initial value in value option', function() {
      assoc = env.create('Consoloid.Base.DeepAssoc', {
        value: { foo: 'bar' }
      });

      assoc.value
        .should.eql({ foo: 'bar' });
    });
  });

  describe('#get(path, defaultValue)', function() {
    beforeEach(function() {
      assoc = env.create('Consoloid.Base.DeepAssoc', {
        value: {
          foo: 'bar',
          test: {
            deep: {
              item: 'testValue'
            }
          },
          to: {
            be: {
              or: {
                not: {
                  to: 'be'
                }
              }
            }
          }
        }
      });
    });

    it('should return value on path', function() {
      assoc.get('test/deep/item')
        .should.equal('testValue');
      assoc.get('foo')
        .should.equal('bar');
      assoc.get('to/be/or/not/to')
        .should.equal('be');
    });

    it('should return default value when path does not exist', function() {
      assoc.get('nonexistent/path', 'defval')
        .should.equal('defval');
    });

    it('should use delimiter given in constructor', function() {
      assoc = env.create('Consoloid.Base.DeepAssoc', {
        delimiter: '.',
        value: {
          foo: 'bar',
          test: {
            deep: {
              item: 'testValue'
            }
          }
        }
      });

      assoc.get('test.deep.item')
        .should.equal('testValue');
    });

    describe('should return complete value object', function() {
      beforeEach(function() {
        assoc = env.create('Consoloid.Base.DeepAssoc', { value: { foo: 'bar' } });
      });

      it('for / path', function() {
        assoc.get('/')
          .should.eql({ foo: 'bar' });
      });

      it('for empty path', function() {
        assoc.get('')
          .should.eql({ foo: 'bar' });
      });
    });

    it('should throw error when path is not a string', function() {
      assoc = env.create('Consoloid.Base.DeepAssoc', { });
      (function() { assoc.get({}); })
        .should.throwError(/path must be a string/);
    });
  });

  describe('#set(path, value)', function() {
    beforeEach(function() {
      assoc = env.create('Consoloid.Base.DeepAssoc', {});
    });

    it('should set value on path', function() {
      assoc.set('test/path', { something: 'interesting'});
      assoc.get('test/path/something')
        .should.equal('interesting');

      assoc.set('test/other', 'value');
      assoc.get('test/other')
        .should.equal('value');
    });

    it('should throw error when item on path is not object', function() {
      assoc.set('test/path', { something: 'interesting'});
      (function() { assoc.set('test/path/something/bad/path', 'error'); })
        .should.throwError(/is not an object/);
      (function() { assoc.set('test/path/something/bad', 'error'); })
        .should.throwError(/is not an object/);
    });
  });

  describe('#require(path, type)', function() {
    beforeEach(function() {
      assoc = env.create('Consoloid.Base.DeepAssoc', { value: {
        str: 'string',
        bool0: true,
        bool1: false,
        obj0: {},
        obj1: env.create('Consoloid.Base.Object', {})
      }});
    });

    it('should return string when string is required', function() {
      assoc.require('str', 'string')
        .should.be.type('string');
    });

    it('should return boolean when boolean is required', function() {
      assoc.require('bool0', 'bool')
        .should.be.type('boolean');
      assoc.require('bool1', 'boolean')
        .should.be.type('boolean');
    });

    it('should return object when object is required', function() {
      assoc.require('obj0', 'Object')
        .should.be.type('object');
      assoc.require('obj1', 'Consoloid.Base.Object')
        .should.be.type('object');
    });

    it('should require object when type is not given', function() {
      assoc.require('obj0')
        .should.be.type('object');
      assoc.require('obj1')
        .should.be.type('object');
    });

    it('should throw error when string is not present but required', function() {
      (function() { assoc.require('obj0', 'string'); })
        .should.throwError(/is not a string/);
    });

    it('should throw error when boolean is not present but required', function() {
      (function() { assoc.require('obj0', 'bool'); })
        .should.throwError(/is not a boolean/);
    });

    it('should throw error when object is not present but required', function() {
      (function() { assoc.require('bool0', 'Object'); })
        .should.throwError(/is not an object with required class/);
    });
  });

  describe('#remove(path, notRequired)', function(){
    beforeEach(function() {
      assoc = env.create('Consoloid.Base.DeepAssoc', {
        value: {
          foo: 'bar',
          test: {
            deep: {
              item: 'testValue'
            }
          }
        }
      });
    });

    it('should remove the  whole content is the path is empty', function(){
      assoc.remove('');
      assoc.get('foo', 'removed').should.be.eql('removed');
      assoc.get('test/deep/item', 'removed').should.be.eql('removed');

      assoc.set('new/value', 'foo');
      assoc.get('new/value').should.be.eql('foo');
    });

    it('should remove the content of the path', function(){
      assoc.remove('test/deep');
      assoc.get('test/deep/item', 'removed').should.be.eql('removed');
      assoc.get('test/deep', 'removed').should.be.eql('removed');
      assoc.get('test', 'notRemoved').should.be.eql({});
      assoc.get('foo', 'notRemoved').should.be.eql('bar');
    });

    it('should return the removed value', function(){
      assoc.remove('test/deep').should.be.eql({item: 'testValue'});
    });

    it('should throw exception if the removable element is not exists', function(){
      (function(){ should.strictEqual(assoc.remove('test/korte')); }).should.throw();
      (function(){ should.strictEqual(assoc.remove('alma/korte')); }).should.throw();
    });

    it('should not throw exception if the removable element is not exists and the notRequired argument is true', function(){
      should.strictEqual(assoc.remove('test/korte', true));
      should.strictEqual(assoc.remove('alma/korte', true));
    });
  });

  describe('#merge(object)', function(){
    it('should extend the current value object with the given object', function(){
      assoc = env.create('Consoloid.Base.DeepAssoc', { value: {foo: 'bar', foo2: 'bar2', obj: {subFoo: 'bar'}}});
      assoc.merge({foo: 'alma', foo3: 'bar3', obj: {subFoo2: 'bar2' }});

      assoc.get('foo').should.be.eql('alma');
      assoc.get('foo2').should.be.eql('bar2');
      assoc.get('foo3').should.be.eql('bar3');
      assoc.get('obj/subFoo').should.be.eql('bar');
      assoc.get('obj/subFoo2').should.be.eql('bar2');
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
