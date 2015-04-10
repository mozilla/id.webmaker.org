var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var ga = require('react-ga');
var ToolTip = require('../tooltip/tooltip.jsx');

var Form = React.createClass({
  propTypes: {
    fields: React.PropTypes.array.isRequired,
    validators: React.PropTypes.object.isRequired,
    origin: React.PropTypes.string.isRequired
  },
  statics: {
      'iconLabels': {
        'username': 'icon-label-username',
        'password': 'icon-label-password',
        'email':    'icon-label-email',
        'error':    'icon-label-error',
        'valid':    'icon-label-valid',
        'key':      'icon-label-password'
      }
  },
  mixins: [
    ValidationMixin,
    React.addons.LinkedStateMixin
  ],
  validatorTypes: false,
  componentWillMount: function() {
    this.validatorTypes = this.props.validators;
    this.errorClass = this.getIconClass('error');
    this.validClass = this.getIconClass('valid');
  },
  getInitialState: function() {
    return {
      username: this.props.defaultUsername || '',
      password: '',
      email: '',
      checked: false,
      dirty: {},
      key: ''
    };
  },
  dirty: function(id, origin) {
    return function(err, valid) {
      if(err) {
        ga.event({category: origin, action: 'Validation Error', label: 'Error on ' + id + ' field.'});
      }
      this.props.passwordError = null;
      var dirty = this.state.dirty;
      dirty[id] = true;
      this.setState({dirty: dirty});
      if ( this.props.onInputBlur ) {
        this.props.onInputBlur(id, this.state.username);
      }
    }.bind(this);
  },
  buildFormElement: function(key, i) {
    // we always expect this.props.fields[i] to be one object with one property.
    var id = Object.keys(this.props.fields[i])[0];
    var value = this.props.fields[i][id];
    this.passChecked = value.checked;
    this.beforeLabel = value.label === undefined ? true : value.label;

    var passwordError = this.props.passwordError;

    if(id === 'password' && !this.isValid(id) && !passwordError) {
      passwordError = 'Invalid Password';
    }
    var isValid = this.isValid(id) && !passwordError;

    var input = (
      <input type={value.type}
             id={id}
             ref={id+'Input'}
             tabIndex={value.tabIndex}
             placeholder={value.placeholder}
             valueLink={this.linkState(id)}
             role={value.type === 'checkbox' ? 'checkbox' : false}
             aria-checked={value.type === 'checkbox' ? 'false' : null}
             onClick={value.type === 'checkbox' ? this.toggleCheckBox : null}
             onBlur={this.handleValidation(id, this.dirty(id, this.props.origin))}
             className={this.getInputClasses(id, isValid)}
             disabled={value.disabled ? "disabled" : false}
             autoFocus={value.focus ? true : false}
      />
    );

    if (value.type === 'checkbox') {
      input = (<span className={value.className}>{input}<span/></span>);
    }
    var errorMessage = value.customError;
    if (!errorMessage) {
      errorMessage = (id === 'password' ? passwordError : this.getValidationMessages(id)[0]);
    }
    var errorTooltip = <ToolTip ref="tooltip" className="warning" message={errorMessage}/>;
    return (
     <label ref={id+'Label'} className={this.getLabelClasses(id, isValid)} key={id} htmlFor={id}>
        {passwordError || !this.isValid(id) ? errorTooltip : false}
        {value.label && value.labelPosition==='before' ? value.label : false}
        {input}
        {value.label && value.labelPosition==='after' ? value.label : false}
     </label>
    );
  },
  render: function() {
     var fields = Object.keys(this.props.fields).map(this.buildFormElement);
     return <div role="form">{fields}</div>;
  },
  getInputClasses: function(field, isValid) {
    var classes = {};
    classes['has-error'] = !isValid;
    classes['is-valid'] = isValid;
    classes['hideLabel'] = !this.beforeLabel;
    classes[this.getIconClass(field)] = true;
    return React.addons.classSet(classes);
  },
  getLabelClasses: function(field, isValid) {
    var classes = {};
    var ref = this.refs[field + 'Input'];
    classes['inputBox'] = field === 'feedback';
    classes[this.getIconClass(field)] = true;
    classes['hideLabel'] = !this.beforeLabel;
    classes[this.errorClass] = !isValid;
    classes[this.validClass] = (field !== 'feedback' && (this.state.dirty[field] && isValid) || this.passChecked)
    return React.addons.classSet(classes);
  },
  getIconClass: function(field) {
    return Form.iconLabels[field];
  },
  toggleCheckBox: function(e) {
    if(e.target.getAttribute('aria-checked') === 'false') {
      e.target.setAttribute('aria-checked','true');
    } else {
      e.target.setAttribute('aria-checked','false');
    }
    e.target.focus();
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
