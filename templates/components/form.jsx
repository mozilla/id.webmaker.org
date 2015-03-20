var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');

var Form = React.createClass({
  propTypes: {
    fields: React.PropTypes.array.isRequired
  },
  statics: {
      'phoneLabels': {
        'username': 'phone-label-username',
        'password': 'phone-label-password'
      }
  },
  mixins: [
    ValidationMixin,
    React.addons.LinkedStateMixin
  ],
  validatorTypes:  {
    username: Joi.string().min(1).required().label('Username'),
    password: Joi.string().min(3).required().label('Password')
  },
  getInitialState: function() {
    return {
      username: null,
      password: null
    };
  },
  buildFormElement: function(key, i) {
    var id = Object.keys(this.props.fields[i]);
    var placeholder = this.props.fields[i][id].placeholder;
    var type = this.props.fields[i][id].type;
    var className = this.getIconClass(id);
    return (
     <label className={className} key={id}>
       <input type={type}
              id={id}
              placeholder={placeholder}
              valueLink={this.linkState(id)}
              onBlur={this.handleValidation(id)}
              className={this.getClasses(id)} />
     </label>
    );
  },
  render: function() {
     var fields = Object.keys(this.props.fields).map(this.buildFormElement);
     return <div role="form">{fields}</div>;
  },
  getClasses: function(field) {
    return React.addons.classSet({
      'form-control': true,
      'has-error': !this.isValid(field),
    });
  },
  getIconClass: function(field) {
    return Form.phoneLabels[field];
  },
  handleReset: function(event) {
    this.clearValidations();
    this.setState(this.getInitialState());
  },
  /**
   * "owner" components call form.processFormData on us
   */
  processFormData: function(callback) {
    var self = this;
    this.validate(function(error, data) {
      console.log("inside Form, we see:", error, data);
      self.onValidate(callback, error,data);
    });
  },
  onValidate: function(callback, error, data) {
    // FIXME: totally not localised yet!!
    var feedbackText = 'Form is invalid do not submit';
    var validText ='Form is valid send to action creator';
    this.setState(
      {
        feedback: error ? feedbackText : validText
      },
      function postValidation() {
        callback(error, !!error? false : JSON.parse(JSON.stringify(this.state)));
      }
    );
  }

});

module.exports = Form;
