var should = require('should');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var RouterStub = require('react-router-stub');
var Signup = require('./signup.jsx');

describe('signup', function() {
  var signupInstance = RouterStub.render(Signup);
  var form = signupInstance.refs.userform;
  var usernameInput = form.refs.usernameInput;
  var userInputEl = usernameInput.getDOMNode();
  var passwordInput = form.refs.passwordInput;
  var passwordInputEl = passwordInput.getDOMNode();
  var emailInput = form.refs.emailInput;
  var emailInputEl = emailInput.getDOMNode();

  afterEach(function() {
    form.setState(form.getInitialState());
  })
  it('should fail when hit the return key with no value', function() {
    TestUtils.Simulate.change(userInputEl, {target: {value: ''}});
    TestUtils.Simulate.submit(userInputEl);
    should(form.state.valid_username).equal(false);
  });
  it('should pass when enter username field the correct value', function() {
    TestUtils.Simulate.change(userInputEl, {target: {value: 'shouldpass'}});
    TestUtils.Simulate.blur(userInputEl);
    should(form.state.valid_username).equal(true);
  });
  it('should fail when enter with empty value for usernameInput', function() {
    TestUtils.Simulate.change(userInputEl, {target: {value: ''}});
    TestUtils.Simulate.blur(userInputEl);
    should(form.state.valid_username).equal(false);
  });
  it('should pass when entered all the fields with the correct values', function() {
    TestUtils.Simulate.change(userInputEl, {target: {value: 'abc'}});
    TestUtils.Simulate.blur(userInputEl);
    TestUtils.Simulate.change(passwordInputEl, {target: {value: 'Aba121Alal'}});
    TestUtils.Simulate.blur(passwordInputEl);
    TestUtils.Simulate.change(emailInputEl, {target: {value: 'abc@aa.com'}});
    TestUtils.Simulate.blur(emailInputEl);
    should(form.state.valid_username).equal(true);
    should(form.state.valid_email).equal(true);
    should(form.state.valid_password).equal(true);
  });
  it('should fail when entered all the fields with the incorrect values', function() {
    TestUtils.Simulate.change(userInputEl, {target: {value: '*a'}});
    TestUtils.Simulate.blur(userInputEl);
    TestUtils.Simulate.change(passwordInputEl, {target: {value: 'Ad'}});
    TestUtils.Simulate.blur(passwordInputEl);
    TestUtils.Simulate.change(emailInputEl, {target: {value: 'abc@aa'}});
    TestUtils.Simulate.blur(emailInputEl);
    should(form.state.valid_username).equal(false);
    should(form.state.valid_email).equal(false);
    should(form.state.valid_password).equal(false);
  });
  it('should fail for username field', function() {
    TestUtils.Simulate.change(userInputEl, {target: {value: '*a'}});
    TestUtils.Simulate.blur(userInputEl);
    TestUtils.Simulate.change(passwordInputEl, {target: {value: 'Adl1aaa0'}});
    TestUtils.Simulate.blur(passwordInputEl);
    TestUtils.Simulate.change(emailInputEl, {target: {value: 'abc@aa.ca'}});
    TestUtils.Simulate.blur(emailInputEl);
    should(form.state.valid_username).equal(false);
    should(form.state.valid_email).equal(true);
    should(form.state.valid_password).equal(true);
  });
  it('should fail for password field', function() {
    TestUtils.Simulate.change(userInputEl, {target: {value: 'a'}});
    TestUtils.Simulate.blur(userInputEl);
    TestUtils.Simulate.change(passwordInputEl, {target: {value: 'Adlaaaaaa'}});
    TestUtils.Simulate.blur(passwordInputEl);
    TestUtils.Simulate.change(emailInputEl, {target: {value: 'abc@aa.ca'}});
    TestUtils.Simulate.blur(emailInputEl);
    should(form.state.valid_username).equal(true);
    should(form.state.valid_email).equal(true);
    should(form.state.valid_password).equal(false);
  });
  it('should fail for email field', function() {
    TestUtils.Simulate.change(userInputEl, {target: {value: 'a'}});
    TestUtils.Simulate.blur(userInputEl);
    TestUtils.Simulate.change(passwordInputEl, {target: {value: 'Bbbb12345'}});
    TestUtils.Simulate.blur(passwordInputEl);
    TestUtils.Simulate.change(emailInputEl, {target: {value: 'abc@aa.'}});
    TestUtils.Simulate.blur(emailInputEl);
    should(form.state.valid_username).equal(true);
    should(form.state.valid_email).equal(false);
    should(form.state.valid_password).equal(true);
  });
});

