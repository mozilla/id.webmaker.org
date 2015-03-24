require('shelljs/global');
var jsFileString = require('./js-files');

exit(exec('node_modules/jscs/bin/jscs --config=node_modules/mofo-style/linters/.jscsrc ' + jsFileString).code);
