var should = require('should');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Form = require('./form.jsx');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username or email',
      'type': 'text',
      'validator': 'username'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password',
      'validator': 'password'
    }
  },
  {
    'email': {
      'placeholder': 'Email',
      'type': 'email',
      'validator': 'email'
    }
  }
];

var fixtures = {
  'username': {
    'valid': 'hello123',
    'invalid': ''
  },
  'password': {
    'valid': 'pas02easdaw',
    'invalid': 'f'
  },
  'email': {
    'valid': 'jon@jbuck.ca',
    'invalid': 'fook'
  }
};

var validators = require('../../lib/validatorset');

var fieldValidators = validators.getValidatorSet(fieldValues);

describe('form', function() {

  describe('prop validation', function() {
    it('should take field and validators props', function () {
      var instance = TestUtils.renderIntoDocument(<Form fields={fieldValues} validators={fieldValidators} />);
    });
    it('should not allow an empty fields or validators prop', function () {
      should.throws(function () {
        var instance = TestUtils.renderIntoDocument(<Form />);
      });
    });
  });

  describe('inputs', function () {

    var instance = TestUtils.renderIntoDocument(<Form fields={fieldValues} validators={fieldValidators} />);
    var el = instance.getDOMNode();

    fieldValues.forEach(function (set) {
      Object.keys(set).forEach(function (name) {
        var field = set[name];

        describe(name, function () {

          var ref;
          var inputEl;

          it('should create an input element', function () {
            ref = instance.refs[name+'Input'];
            inputEl = ref.getDOMNode();
            should(inputEl).be.ok;
          });
          it('should accept the valid value', function () {
            TestUtils.Simulate.change(inputEl, {target: {value: fixtures[name].valid}});
            TestUtils.Simulate.blur(inputEl);
            should(instance.isValid(name)).be.equal(true);
          });
          it('should not accept an invalid value', function () {
            TestUtils.Simulate.change(inputEl, {target: {value: fixtures[name].invalid}});
            TestUtils.Simulate.blur(inputEl);
            should(instance.isValid(name)).be.equal(false);
          });
        });

      });
    });
  });

});

