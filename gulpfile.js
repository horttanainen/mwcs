var gulp = require( 'gulp' ),
  concat = require( 'gulp-concat' ),
  uglify = require( 'gulp-uglify' ),
  rename = require( 'gulp-rename' );

gulp.task('scripts', function () {
  return gulp.src([ 
    'public/js/sol.js',
    'public/js/sol.model.js',
    'public/js/sol.shell.js',
    'public/js/sol.list.js',
    'public/js/sol.file.js',
    'public/js/sol.salary_calculator.js',
    'public/js/sol.csv_handler.js'])
    .pipe( concat( 'concanated_and_minified.js') )
    .pipe( rename({ suffix : '.min' }) )
    .pipe( uglify() )
    .pipe( gulp.dest( 'public/js/jq'));
});

gulp.task('css', function () {
  return gulp.src( 'public/css/*.css' )
    .pipe( concat( 'concanated.css') )
    .pipe( gulp.dest( 'public/js/jq'));
});

gulp.task( 'watch', function () {
  gulp.watch('public/js/*.js', ['scripts']);
  
  gulp.watch('public/css/*.css', ['css']);
});

gulp.task( 'default', ['scripts', 'css', 'watch']);
