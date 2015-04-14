var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var ga = require('react-ga');
var ToolTip = require('../tooltip/tooltip.jsx');
var WebmakerActions = require('../../lib/webmaker-actions.jsx');
var API = require('../../lib/api.jsx');
var Router = require('react-router');

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
    React.addons.LinkedStateMixin,
    Router.Navigation,
    Router.State,
    API
  ],
  validatorTypes: false,
  componentWillMount: function() {
    this.validatorTypes = this.props.validators;
    this.errorClass = this.getIconClass('error');
    this.validClass = this.getIconClass('valid');
  },
  componentDidMount: function() {
    WebmakerActions.addListener('FORM_ERROR', this.formError);
    WebmakerActions.addListener('FORM_VALID', this.setFormState);
  },
  componentWillUnmount: function() {
    WebmakerActions.deleteListener('FORM_ERROR', this.formError);
    WebmakerActions.deleteListener('FORM_VALID', this.setFormState);
  },
  getInitialState: function() {
    return {
      username: this.getQuery().username || '',
      password: '',
      email: '',
      checked: false,
      dirty: {},
      key: '',
      errorMessage: {},
      valid_username: false,
      passwordError: false
    };
  },
  setFormState: function(data) {
    this.setState({
      valid_username: true,
      errorMessage: {[data.field]: null}
    });
  },
  formError: function(data) {
    this.setState({
      ['valid_'+data.field]: false,
      errorMessage: {
        [data.field]: data.message
      }
    });
  },
  dirty: function(id, origin) {
    return (err, valid) => {
      if(err) {
        ga.event({category: origin, action: 'Validation Error', label: 'Error on ' + id + ' field.'});
      }
      this.state.passwordError = null;
      this.handleBlur(id, this.state.username)
    }
  },
  handleBlur: function(fieldName, value) {
    if( (this.state.valid_username && fieldName === 'username') || fieldName === 'username' ) {
      this.checkUsername(fieldName, value);
    }
   if ( this.props.onInputBlur ) {
     this.props.onInputBlur(fieldName, value);
    }
    var dirty = this.state.dirty;
    dirty[fieldName] = true;
    this.setState({
      dirty: dirty
    });

  },
  buildFormElement: function(key, i) {
    // we always expect this.props.fields[i] to be one object with one property.
    var id = Object.keys(this.props.fields[i])[0];
    var value = this.props.fields[i][id];
    this.passChecked = value.checked;
    this.beforeLabel = value.label === undefined ? true : value.label;

    var passwordError = this.state.passwordError;

    if(id === 'password' && !this.isValid(id) && !passwordError) {
      passwordError = 'Invalid Password';
    }

    var isValid = !this.state.errorMessage[id] && this.isValid(id) && !passwordError;

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
    var errorMessage = (id === 'password' ? this.state.errorMessage[id] || passwordError : this.state.errorMessage[id] || this.getValidationMessages(id)[0]);
    var errorTooltip = <ToolTip ref="tooltip" className="warning" message={errorMessage}/>;
    return (
     <label ref={id+'Label'} className={this.getLabelClasses(id, isValid)} key={id} htmlFor={id}>
        {passwordError || !isValid ? errorTooltip : false}
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
      self.onValidate(callback, error, data);
    });
  },
  onValidate: function(callback, error, data) {
    callback(error, !!error? false : JSON.parse(JSON.stringify(this.state)));
  }
});

module.exports = Form;
