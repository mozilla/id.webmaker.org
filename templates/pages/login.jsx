var React = require('react');

var Form = require('../components/form.jsx');
var Header = require('../components/header.jsx');

// This wraps every view
var Login = React.createClass({

  render: function() {
    // FIXME: totally not localized yet!
    var buttonText = "Log In";
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
      }
    ];
    return (
      <div>
        <Header />
        <div className="formContainer centerDiv">
          <div className="innerForm">
            <Form ref="userform" fields={fieldValues} />
            <button onClick={this.processFormData} className="btn btn-awsm">{buttonText}</button>
          </div>
        </div>
      </div>
    );
  },
  processFormData: function() {
    var form = this.refs.userform;
    form.processFormData(this.handleFormData);
  },
  handleFormData: function(error, data) {
    console.log("inside App we see:", error, data);
  }
});

module.exports = Login;