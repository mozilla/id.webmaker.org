/* Adapted from https://github.com/jurassix/react-validation-mixin/

--- LICENSE ---
The MIT License (MIT)

Copyright (c) 2015 Clint Ayres

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
---
*/

const factory = require('react-validation-mixin/lib/validationFactory').default;
const strategy = require('json-schema-validation-strategy');

const validator = factory(strategy);

const ValidationMixin = {
  /**
   * Check for sane configurations
   */
  componentDidMount() {
    if (this.validatorTypes !== undefined && typeof this.validatorTypes !== "object") {
      throw Error('invalid `validatorTypes` type');
    }
  },

  /* Get current validation messages for a specified key or entire form.
   *
   * @param {?String} key to get messages, or entire form if key is undefined.
   * @return {Array}
   */
  getValidationMessages(key) {
    return validator.getValidationMessages(this.state.errors, key) || [];
  },

  /* Convenience method to validate a key via an event handler. Useful for
   * onBlur, onClick, onChange, etc...
   *
   * @param {?String} State key to validate
   * @return {function} validation event handler
   */
  handleValidation(key, callback) {
    return () => {
      this.validate(key, callback);
    };
  },

  /* Method to validate single form key or entire form against the component data.
   *
   * @param {String|Function} key to validate, or error-first containing the validation errors if any.
   * @param {?Function} error-first callback containing the validation errors if any.
   */
  validate(/* [key], callback */) {
    const fallback = arguments.length <= 1 && typeof arguments[0] === 'function' ? arguments[0] : undefined;
    const key = arguments.length <= 1 && typeof arguments[0] === 'function' ? undefined : arguments[0];
    const callback = arguments.length <= 2 && typeof arguments[1] === 'function' ? arguments[1] : fallback;

    const data = this.state;
    const schema = this.validatorTypes;

    const options = {
      key,
      prevErrors: this.state.errors,
    };
    validator.validate(data, schema, options, nextErrors => {
      this.setState({ errors: { ...nextErrors } }, this._invokeCallback.bind(this, key, callback));
    });
  },

  /* Clear all previous validations
   *
   * @return {void}
   */
  clearValidations(callback) {
    return this.setState({
      errors: {},
    }, callback);
  },

  /* Check current validity for a specified key or entire form.
   *
   * @param {?String} key to check validity (entire form if undefined).
   * @return {Boolean}.
   */
  isValid(key) {
    return validator.isValid(this.state.errors, key);
  },

  /* Private method that handles executing users callback on validation
   *
   * @param {Object} errors object keyed on data field names.
   * @param {Function} error-first callback containing the validation errors if any.
   */
  _invokeCallback(key, callback) {
    if (typeof callback !== 'function') {
      return;
    }
    if (this.isValid(key)) {
      callback();
    } else {
      callback(this.state.errors);
    }
  }

};

module.exports = ValidationMixin;
