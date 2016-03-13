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
import yargs from 'yargs';
import runSequence from 'run-sequence';

const args = yargs.argv;

let OUTPUT_DIR, HTML_GLOB, CSS_GLOB, SCRIPTS_GLOB;

let widget_dir = null;

gulp.task( 'ubershit', () => {
    widget_dir = args.directory;

    OUTPUT_DIR = `${widget_dir}/dist/`;
    HTML_GLOB = `${widget_dir}/**/**/*.html`;
    CSS_GLOB = ['internal/css/reset.scss', 'internal/css/defaults.scss', `${widget_dir}/**/**/*.scss`];
    SCRIPTS_GLOB = ['internal/scripts/command.js', `${widget_dir}/**/*.js`];

    runSequence( ['html', 'css', 'scripts'] );

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

gulp.task( 'watch', () => {
    gulp.watch( HTML_GLOB, ['html'] );
    gulp.watch( CSS_GLOB, ['css'] );
    gulp.watch( SCRIPTS_GLOB, ['scripts'] );
});

//
// gulp.task( 'default', ['html', 'css', 'scripts'], () => {
//     gulp.watch( HTML_GLOB, ['html'] );
//     gulp.watch( CSS_GLOB, ['css'] );
//     gulp.watch( SCRIPTS_GLOB, ['scripts'] );
// });
