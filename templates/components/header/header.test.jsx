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
  var el;

  beforeEach(function() {
    instance = RouterStub.render(Header, testProps);
    el = instance.getDOMNode();
  });

  afterEach(function () {
    RouterStub.unmount(instance);
    el = null;
  });

  it('should contain the redirectText', function () {
    should(instance.refs.text.props.children).be.equal(testProps.redirectText);
  });
  it('should create a link to the redirect page', function () {
    should(instance.refs.link.props.to).be.equal(testProps.redirectPage);
    should(el.querySelector('a')).be.ok;
  });

});
