'use strict';

// Dependencies:
const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const exec = require( 'child_process' ).exec;
const chokidar = require( 'chokidar' );
const fs = require( 'fs' );
const gulp = require( 'gulp' );
const concat = require( 'gulp-concat' );
const scss = require( 'gulp-sass' );
const cssMin = require( 'gulp-minify-css' );
const rename = require( 'gulp-rename' );
const prefix = require( 'gulp-autoprefixer' );
const ugly = require( 'gulp-uglify' );
const babel = require( 'gulp-babel' );
const insert = require( 'gulp-insert' );
const replace = require( 'gulp-replace' );
const del = require( 'del' );
const yargs = require( 'yargs' );
const runSequence = require( 'run-sequence' );

// Path constants:
const BASE_DIR = app.getPath( 'userData' );
const WIDGET_DIR = `${BASE_DIR}/widgets`;
const OUTPUT_DIR = `${BASE_DIR}/dist`;
const HTML_GLOB = `${WIDGET_DIR}/**/**/*.html`;
const CSS_GLOB = ['internal/css/reset.scss', 'internal/css/defaults.scss', `${WIDGET_DIR}/**/**/*.scss`];
const SCRIPTS_GLOB = ['internal/scripts/command.js', `${WIDGET_DIR}/**/*.js`];
const npmDirectory = `${BASE_DIR}/node_modules`;

// Gulp tasks:
gulp.task( 'ubershit', () => {
    console.log( `gulp widget directory: ${WIDGET_DIR}` );
    console.log( `gulp output directory: ${OUTPUT_DIR}` );

    runSequence( /*'clean', */['html', 'css', 'scripts'] );

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
});

gulp.task( 'css', () => {
    console.log( `css outputting to ${OUTPUT_DIR}` );
    return gulp.src( CSS_GLOB )
        .pipe( scss() )
        .pipe( concat( 'style.scss' ) )
        .pipe( prefix( ['last 2 version', '> 1%', 'ie 8', 'ie 7', 'Firefox > 15'], { cascade: true } ) )
        .pipe( cssMin() )
        .pipe( rename( 'style.css' ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'scripts', () => {
    console.log( `scripts outputting to ${OUTPUT_DIR}` );
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


// Make the widgets directory if it doesn't exist:
if( !fs.existsSync( WIDGET_DIR ) ) {
    fs.mkdir( WIDGET_DIR, ( err ) => {
        if( err ) {
            console.log( err );
            return;
        }
    });
}

// Make the dist directory if it doesn't exist:
if( !fs.existsSync( OUTPUT_DIR ) ) {
    fs.mkdir( OUTPUT_DIR, ( err ) => {
        if( err ) {
            console.log( err );
            return;
        }
    });
}

const makeNodeModuleSymlinks = ( modules ) => {
    modules.forEach( ( module ) => {
        fs.symlink( `${__dirname}/node_modules/${module}`, `${npmDirectory}/${module}`, ( err ) => {
            if( err ) {
                console.log( `error symlinking module: ${module}: `, err );
            }
        });
    });
};

// Make the node_modules directory if it doesn't exist:
if( !fs.existsSync( npmDirectory) ) {
    fs.mkdir( npmDirectory, ( err ) => {
        makeNodeModuleSymlinks([
            'babel-preset-es2015',
            'osascript',
            'gulp',
            'gulp-autoprefixer',
            'gulp-babel',
            'gulp-concat',
            'gulp-insert',
            'gulp-minify-css',
            'gulp-rename',
            'gulp-sass',
            'gulp-uglify'
        ]);
    });
}

var mainWindow = null;

app.on( 'window-all-closed', () => {
    if( process.platform != 'darwin' ) {
        // quit gulp?
        app.quit();
    }
});

app.on( 'ready', () => {
    const electronScreen = electron.screen;
    const size = electronScreen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        type: 'desktop',
        transparent: true,
        frame: false,
        resizable: false,
        movable: false,
        width: size.width,
        height: size.height
    });

    mainWindow.loadURL( `file://${OUTPUT_DIR}/index.html` );

    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on( 'did-finish-load', () => {
        mainWindow.webContents.send( 'ping', 'opening message!' );
    });

    const watcher = chokidar.watch( `${OUTPUT_DIR}`, {
        ignoreInitial: true,
        persistent: true
    });

    watcher
        .on( 'change', ( path ) => {
            console.log( 'reloading' );
            mainWindow.reload();
        })
        .on( 'add', ( path ) => {
            console.log( 'reloading' );
            mainWindow.reload();
        });

    gulp.start( 'ubershit' );

    mainWindow.on( 'closed', function() {
        mainWindow = null;
    });
});
