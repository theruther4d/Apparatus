'use strict';

import gulp from 'gulp';
import concat from 'gulp-concat';
import scss from 'gulp-sass';
import cssMin from 'gulp-minify-css';
import rename from 'gulp-rename';
import prefix from 'gulp-autoprefixer';
import ugly from 'gulp-uglify';
import babel from 'gulp-babel';
import insert from 'gulp-insert';
import browserSync from 'browser-sync';
import del from 'del';
import fs from 'fs';

const WIDGET_DIR = './widgets';
const OUTPUT_DIR = './dist';
const HTML_GLOB = `${WIDGET_DIR}/**/**/*.html`;
const CSS_GLOB = ['internal/css/reset.scss', 'internal/css/defaults.scss', `${WIDGET_DIR}/**/**/*.scss`];
const SCRIPTS_GLOB = ['internal/scripts/command.js', `${WIDGET_DIR}/**/*.js`];

gulp.task( 'html', () => {
    return gulp.src( HTML_GLOB )
        .pipe( concat( 'index.html' ) )
        .pipe( insert.prepend( fs.readFileSync( `${__dirname}/internal/html/head.html` ) ) )
        .pipe( insert.append( fs.readFileSync( `${__dirname}/internal/html/foot.html` ) ) )
        .pipe( gulp.dest( OUTPUT_DIR ) )
        .pipe( browserSync.stream() );
});

gulp.task( 'css', () => {
    return gulp.src( CSS_GLOB )
        .pipe( concat( 'style.scss' ) )
        .pipe( scss() )
        .pipe( prefix( ['last 2 version', '> 1%', 'ie 8', 'ie 7', 'Firefox > 15'], { cascade: true } ) )
        .pipe( cssMin() )
        .pipe( rename( 'style.css' ) )
        .pipe( gulp.dest( OUTPUT_DIR ) )
        .pipe( browserSync.stream() );
});

gulp.task( 'scripts', () => {
    return gulp.src( SCRIPTS_GLOB )
        .pipe( babel() )
        .pipe( concat( 'scripts.js' ) )
        // .pipe( ugly() )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'default', ['html', 'css', 'scripts'], () => {
    gulp.watch( HTML_GLOB, ['html'] );
    gulp.watch( CSS_GLOB, ['css'] );
    gulp.watch( SCRIPTS_GLOB, ['scripts'] );
});
