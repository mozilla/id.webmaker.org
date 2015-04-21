var should = require('should');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Form = require('./form.jsx');
var RouterStub = require('react-router-stub');
var Signup = require('../../pages/signup.jsx');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password'
    }
  },
  {
    'email': {
      'placeholder': 'Email',
      'type': 'email'
    }
  }
];

var fixtures = {
  'username': {
    'valid': 'hello123',
    'invalid': ''
  },
  'password': {
    'valid': 'pas02easDaw',
    'invalid': 'f'
  },
  'email': {
    'valid': 'jon@jbuck.ca',
    'invalid': 'fook'
  }
};


describe('form', function() {

  describe('inputs', function () {
    var signupInstance = RouterStub.render(Signup);
    var instance = RouterStub.render(Form, {onInputBlur: signupInstance.handleBlur, 'origin': 'test', fields: fieldValues}, {
      getCurrentQuery () {
        return { username: true };
      },
      getCurrentPathname () {
        return 'test';
      }
    });

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
            should(instance.state['valid_' + name]).be.equal(true);
          });
          it('should not accept an invalid value', function () {
            TestUtils.Simulate.change(inputEl, {target: {value: fixtures[name].invalid}});
            TestUtils.Simulate.blur(inputEl);
            should(instance.state['valid_' + name]).be.equal(false);
          });
          it('should not pass with empty fields', function () {
            TestUtils.Simulate.click(inputEl);
            TestUtils.Simulate.keyDown(inputEl, {key: "Enter"});
            should(instance.state['valid_' + name]).be.equal(false);
          });
        });

      });
    });
    describe('submit for all fields', function() {

      it('should pass for username valid > invalid > valid', function () {
        var signupInstance2 = RouterStub.render(Signup);
        var instance3 = RouterStub.render(Form, {
          onInputBlur: signupInstance2.handleBlur, 'origin': 'test', fields:
            [
              {
                'username': {
                  'placeholder': 'Username',
                  'type': 'text'
                }
              }
            ]
          });
        var ref1 = instance3.refs.usernameInput;
        var usernameInput = ref1.getDOMNode();
        should(signupInstance2.refs.userform.state.valid_username).be.equal(true);
        TestUtils.Simulate.change(usernameInput, {target: {value: 'aa@aa'}});
        TestUtils.Simulate.blur(usernameInput);
        should(signupInstance2.refs.userform.state.valid_username).be.equal(false);
        TestUtils.Simulate.change(usernameInput, {target: {value: 'suck221'}});
        TestUtils.Simulate.blur(usernameInput);
        should(signupInstance2.refs.userform.state.valid_username).be.equal(true);

      });
    })
  });

});

