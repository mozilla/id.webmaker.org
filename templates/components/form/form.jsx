var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');

var Form = React.createClass({
  propTypes: {
    fields: React.PropTypes.array.isRequired
  },
  statics: {
      'iconLabels': {
        'username': 'icon-label-username',
        'password': 'icon-label-password',
        'email':    'icon-label-email'
      }
  },
  mixins: [
    ValidationMixin,
    React.addons.LinkedStateMixin
  ],
  validatorTypes: false,
  componentWillMount: function() {
    this.validatorTypes = this.props.validators;
  },
  getInitialState: function() {
    return {
      username: null,
      password: null,
      email: null
    };
  },
  buildFormElement: function(key, i) {
    var id = Object.keys(this.props.fields[i]);
    var placeholder = this.props.fields[i][id].placeholder;
    var type = this.props.fields[i][id].type;
    var label = this.props.fields[i][id].label;
    var labelPosition = this.props.fields[i][id].labelPosition;
    var className = this.getIconClass(id);

    function foo() {
      console.log('foo');
      this.handleValidation(id);
    }

    var input = (
      <input type={type}
             id={id}
             placeholder={placeholder}
             valueLink={this.linkState(id)}
             onBlur={this.handleValidation(id)}
             className={this.getClasses(id)}
             ref={id} />
    );

    if (type === 'checkbox') {
      input = (<span>{input}<span/></span>);
    }

    return (
     <label className={className} key={id} htmlFor={id}>
        {label && labelPosition==='before' ? label : false}
        {input}
        {label && labelPosition==='after' ? label : false}
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
    return Form.iconLabels[field];
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
      self.onValidate(callback, error, data);
    });
  },
  onValidate: function(callback, error, data) {
    callback(error, !!error? false : JSON.parse(JSON.stringify(this.state)));
  }
});

module.exports = Form;
