var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('eslint', function lintJs() {
    return gulp.src('lib/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('cs', ['eslint']);
