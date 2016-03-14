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
import replace from 'gulp-replace';
import browserSync from 'browser-sync';
import del from 'del';
import fs from 'fs';
import yargs from 'yargs';
import runSequence from 'run-sequence';

const args = yargs.argv;

let BASE_DIR, OUTPUT_DIR, HTML_GLOB, CSS_GLOB, SCRIPTS_GLOB, WIDGET_DIR;

gulp.task( 'ubershit', () => {
    BASE_DIR = args.directory;
    WIDGET_DIR = `${args.directory}/widgets`;
    OUTPUT_DIR = `${args.directory}/dist`;

    console.log( `gulp widget directory: ${WIDGET_DIR}` );
    console.log( `gulp output directory: ${OUTPUT_DIR}` );

    HTML_GLOB = `${WIDGET_DIR}/**/**/*.html`;
    CSS_GLOB = ['internal/css/reset.scss', 'internal/css/defaults.scss', `${WIDGET_DIR}/**/**/*.scss`];
    SCRIPTS_GLOB = ['internal/scripts/command.js', `${WIDGET_DIR}/**/*.js`];

    runSequence( 'clean', ['html', 'css', 'scripts'] );

    gulp.watch( HTML_GLOB, ['html'] );
    gulp.watch( CSS_GLOB, ['css'] );
    gulp.watch( SCRIPTS_GLOB, ['scripts'] );
});

gulp.task( 'html', () => {
    console.log( `html outputting to ${OUTPUT_DIR}` );
    return gulp.src( HTML_GLOB )
        .pipe( concat( 'index.html' ) )
        .pipe( insert.prepend( fs.readFileSync( `${__dirname}/internal/html/head.html` ) ) )
        .pipe( insert.append( fs.readFileSync( `${__dirname}/internal/html/foot.html` ) ) )
        .pipe( replace( 'WIDGET_DIR', BASE_DIR ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
        // .pipe( browserSync.stream() );
});

gulp.task( 'css', () => {
    return gulp.src( CSS_GLOB )
        .pipe( scss() )
        .pipe( concat( 'style.scss' ) )
        .pipe( prefix( ['last 2 version', '> 1%', 'ie 8', 'ie 7', 'Firefox > 15'], { cascade: true } ) )
        .pipe( cssMin() )
        .pipe( rename( 'style.css' ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
        // .pipe( browserSync.stream() );
});

gulp.task( 'scripts', () => {
    return gulp.src( SCRIPTS_GLOB )
        .pipe( babel( {
            presets: ['es2015']
        } ) )
        .pipe( concat( 'scripts.js' ) )
        // .pipe( ugly() )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'watch', () => {
    gulp.watch( HTML_GLOB, ['html'] );
    gulp.watch( CSS_GLOB, ['css'] );
    gulp.watch( SCRIPTS_GLOB, ['scripts'] );
});

gulp.task( 'clean', () => {
    del( `${OUTPUT_DIR}/**`, `!${OUTPUT_DIR}` );
});
