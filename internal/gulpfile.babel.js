import gulp from 'gulp';
import babel from 'gulp-babel';
import scss from 'gulp-sass';
import cssMin from 'gulp-minify-css';
import prefix from 'gulp-autoprefixer';
import concat from 'gulp-concat';

const BASE_DIR = __dirname.replace( '/internal', '' );
const CSS_GLOB = 'css/**/*.scss';
const SCRIPTS_GLOB = [ 'scripts/Ubershit.js', 'scripts/onready.js', 'scripts/**/*.js' ];
const OUTPUT_DIR = `${BASE_DIR}/includes`;

gulp.task( 'default', ['css', 'scripts'] );

gulp.task( 'css', () => {
    return gulp.src( CSS_GLOB )
        .pipe( scss() )
        .pipe( concat( 'style.css' ) )
        .pipe( prefix( ['last 2 version', '> 1%', 'ie 8', 'ie 7', 'Firefox > 15'], { cascade: true } ) )
        .pipe( cssMin() )
        .pipe( gulp.dest( `${OUTPUT_DIR}/css` ) );
});

gulp.task( 'scripts', () => {
    return gulp.src( SCRIPTS_GLOB )
        .pipe( babel( {
            presets: ['es2015']
        } ) )
        .pipe( concat( 'scripts.js' ) )
        .pipe( gulp.dest( `${OUTPUT_DIR}/scripts` ) );
});

gulp.task( 'watch', () => {
    gulp.watch( CSS_GLOB, ['css'] );
    gulp.watch( SCRIPTS_GLOB, ['scripts'] );
});
