var should = require('should');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var RouterStub = require('react-router-stub');
var Header = require('./header.jsx');

var testProps = {
  redirectText: 'Already have an account?',
  redirectPage: 'login',
  redirectLabel: 'login'
};

describe('header', function() {

  var instance;

  beforeEach(function() {
    instance = RouterStub.render(Header, testProps);
  });
  afterEach(function () {
    RouterStub.unmount(instance);
  });

  it('should contain the redirectText', function () {
    console.log(instance);
    var signUpEl = instance.refs.signUp.getDOMNode();
    should(signUpEl.innerHTML).equal('Sign up');
  });

});
