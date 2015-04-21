var React = require('react/addons');
var ga = require('react-ga');
var ToolTip = require('../tooltip/tooltip.jsx');
var WebmakerActions = require('../../lib/webmaker-actions.jsx');
var API = require('../../lib/api.jsx');
var formValidations = require('../../lib/form-validations/form-validation.jsx');

var Form = React.createClass({
  propTypes: {
    fields: React.PropTypes.array.isRequired,
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
    React.addons.LinkedStateMixin,
    API,
    formValidations
  ],
  componentWillMount: function() {
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
      username: this.props.defaultUsername || '',
      password: '',
      email: '',
      feedback: false,
      errorMessage: {},
      valid_username: true,
      valid_password: true,
      valid_feedback: true,
      valid_email: true
    };
  },
  setFormState: function(data) {
    var errorMessage = this.state.errorMessage || {}
    errorMessage = Object.assign({}, this.state.errorMessage);
    errorMessage[data.field] = null;
    this.setState({
      ['valid_' + data.field]: true,
      errorMessage: errorMessage
    });
  },
  formError: function(data) {
    data.map((err) => {
      err = err[0] || err;
      var errorMessage = this.state.errorMessage;
      errorMessage[err.field] = err.message;
      errorMessage = Object.assign({}, errorMessage);
      this.setState({
        ['valid_' + err.field]: false,
        errorMessage: errorMessage
      });
    });
  },
  buildFormElement: function(key, i) {
    // we always expect this.props.fields[i] to be one object with one property.
    var id = Object.keys(this.props.fields[i])[0];
    var value = this.props.fields[i][id];
    this.passChecked = value.checked;
    this.beforeLabel = value.label === undefined ? true : value.label;
    var passwordError = 'Invalid password.';

    var isValid = !this.state.errorMessage[id];

    var input = (
      <input type={value.type}
             id={id}
             ref={id+'Input'}
             tabIndex={value.tabIndex}
             name={id}
             placeholder={value.placeholder}
             autoComplete={this.props.autoComplete ? this.props.autoComplete : "on"}
             valueLink={this.linkState(id)}
             defaultValue={this.props.defaultUsername}
             onBlur={this.props.onInputBlur}
             className={this.getInputClasses(id, isValid)}
             disabled={value.disabled ? "disabled" : false}
             autoFocus={value.focus ? true : false}
      />
    );

    if (value.type === 'checkbox') {
      var input = (
        <input type={value.type}
               id={id}
               ref={id+'Input'}
               checked={this.state.feedback}
               tabIndex={value.tabIndex}
               role='checkbox'
               aria-checked='false'
               onChange={this.toggleCheckBox}
               onBlur={this.props.onInputBlur}
               className={this.getInputClasses(id, isValid)}
        />
      );
      input = (<span className={value.className}>{input}<span/></span>);
    }
    var errorMessage = this.state.errorMessage[id];
    var errorTooltip = <ToolTip ref="tooltip" className="warning" message={errorMessage}/>;

    return (
     <label ref={id+'Label'} className={this.getLabelClasses(id, isValid)} key={id} htmlFor={id}>
        {!isValid ? errorTooltip : false}
        {value.label && value.labelPosition==='before' ? value.label : false}
        {input}
        {value.label && value.labelPosition==='after' ? value.label : false}
     </label>
    );
  },
  render: function() {
     var fields = Object.keys(this.props.fields).map(this.buildFormElement);
     return (
        <div role="form">
          <form autoComplete={this.props.autoComplete ? this.props.autoComplete : "on"}
                action="#"
                onSubmit={this.props.handleSubmit}
                id="form">
            {fields}
            { this.props.autoComplete === 'off' ?
              (
                /* this is a hack to stop autocomplete for username and password on signup page */
                <div>
                  <input className="hidden" type="text" name="fakeusernameremembered"/>
                  <input className="hidden" type="password" name="fakepasswordremembered"/>
                </div>)
              : false
            }
            <input className="hidden" type="submit"/>
          </form>
        </div>
      );
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
    classes[this.validClass] = (field !== 'feedback' && (this.state[field] && isValid) || this.passChecked)
    return React.addons.classSet(classes);
  },
  getIconClass: function(field) {
    return Form.iconLabels[field];
  },
  toggleCheckBox: function(e) {
    if(e.target.getAttribute('aria-checked') === 'false') {
      this.setState({feedback: !this.state.feedback});
      e.target.setAttribute('aria-checked','true');
    } else {
      this.setState({feedback: !this.state.feedback});
      e.target.setAttribute('aria-checked','false');
    }
    e.target.focus();
  },
  /**
   * "owner" components call form.processFormData on us
   */
  processFormData: function(e, callback) {
    e.preventDefault();
    this.validateAll((result) => {
      this.checkUsername(this.state.username, (json) => {
        if(json.statusCode === 500) {
          this.formError([{'field': 'username', 'message': 'Whoops! Something went wrong. Please try again.'}]);
          return;
        }
        json.username = this.state.username;
        var obj = {};
        obj.userObj = json;
        obj.user = JSON.parse(JSON.stringify(this.state));
        if(result) {
          return callback(result.err, obj);
        }
        callback(null, obj);
      });
    });
  }
});

module.exports = Form;
