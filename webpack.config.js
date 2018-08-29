require('habitat').load('.env');
var webpack = require('webpack');

var IMPORT_ES5_SHIM = 'imports?shim=es5-shim/es5-shim&' +
                      'sham=es5-shim/es5-sham';

function importEnvVars(keys) {
  var result = {};

  keys.forEach(function(key) {
    var value = process.env[key];

    if ( typeof value === 'string' ) {
      result['process.env.' + key] = JSON.stringify(value);
    }
  });

  return result;
}

module.exports = {
  entry: {
    app: './templates/index.jsx',
    tests: './test/browser.tests.jsx',
    manual: './test/manual.tests.jsx'
  },
  devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
  output: {
    path: __dirname + '/public',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['babel?experimental&optional=runtime', 'jsx-loader'] },
      { test: require.resolve('json-schema-validation-strategy'), loader: 'babel?experimental&optional=runtime' },
      { test: require.resolve('react-validation-mixin/lib/validationFactory'), loader: 'babel?experimental&optional=runtime' },
      // https://github.com/webpack/webpack/issues/558#issuecomment-60889168
      { test: require.resolve('react'), loader: IMPORT_ES5_SHIM },
      { test: require.resolve('react/addons'), loader: IMPORT_ES5_SHIM },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  node: {
    net: 'empty',
    dns: 'empty'
  },
  plugins: [
    new webpack.DefinePlugin(importEnvVars([
      // Any variables we want to expose to the client:
      'GA_TRACKING_ID',
      'GA_DEBUG',
      'OPTIMIZELY_ID',
      'OPTIMIZELY_ACTIVE',
      'RECAPTCHA_DISABLED',
      'RECAPTCHA_SITE_KEY'
    ]))
  ]
};
