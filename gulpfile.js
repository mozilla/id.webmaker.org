var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');

var LINT_DIRS = [
  '*.js',
  'lib/**/*.js',
  'test/**/*.js',
  'web/**/*.js'
];

/**
 * JavaScript style validation, using JSCS
 */
gulp.task('jscs', function() {
  return gulp.src(LINT_DIRS)
    .pipe(jscs({
      configPath: 'node_modules/mofo-style/linters/.jscsrc'
    }));
});

gulp.task('jshint', function() {
  return gulp.src(LINT_DIRS)
      .pipe(jshint({
        lookup: 'node_modules/mofo-style/linters/.jshintrc'
      }))
      .pipe(jshint.reporter('default'));
});
