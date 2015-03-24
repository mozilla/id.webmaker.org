var should = require('should');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Header = require('./header.jsx');

describe('header', function() {

  var instance;

  describe('with a container reference required', function() {
    beforeEach(function() {
      instance = TestUtils.renderIntoDocument(<Header />);
    });

    it('should contain the words "Sign up"', function() {
      var signUpEl = instance.refs.signUp.getDOMNode();
      should(signUpEl.innerHTML).equal('Sign up');
    });
  });
});

