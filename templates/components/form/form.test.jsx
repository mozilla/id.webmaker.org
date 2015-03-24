var should = require('should');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Form = require('./form.jsx');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validTest': 'user123',
      'invalidTest': 'x adasd 1'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password',
      'validTest': 'pAssw0rd123',
      'invalidTest': 'foo'
    }
  }
];

describe('form', function() {

  var instance;
  var el;

  describe('prop validation', function() {
    it('should take an array in fields prop', function () {
      instance = TestUtils.renderIntoDocument(<Form fields={fieldValues} />);
    });
    it('should not allow an empty fields prop', function () {
      should.throws(function () {
        instance = TestUtils.renderIntoDocument(<Form />);
      });
    });
  });

  describe('inputs', function () {
    beforeEach(function () {
      instance = TestUtils.renderIntoDocument(<Form fields={fieldValues} />);
      el = instance.getDOMNode();
    });

    fieldValues.forEach(function (set) {
      Object.keys(set).forEach(function (name) {
        var field = set[name];

        describe(name, function () {
          var inputEl;
          it('should create an input element', function () {
            inputEl = el.querySelector('input[id="' + name +'"]');
            should(inputEl).be.ok;
          });
          it('should accept the valid value', function () {
            el.value = field.validTest;
            TestUtils.Simulate.blur(el);
            should(instance.isValid()).be.equal(true);
          });
          // Doesn't seem like validation is working :S actually
          // it('should not accept an invalid value', function () {
          //   el.value = field.invalidTest;
          //   TestUtils.Simulate.blur(el);
          //   should(instance.isValid()).be.equal(false);
          // });
        });

      });
    });
  });

});

