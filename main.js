'use strict';

const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const exec = require( 'child_process' ).exec;
const chokidar = require( 'chokidar' );
const fs = require( 'fs' );
const ubershitDirectory = app.getPath( 'userData' );
const widgetDirectory = `${ubershitDirectory}/widgets`;
const distDirectory = `${ubershitDirectory}/dist`;
const npmDirectory = `${ubershitDirectory}/node_modules`;
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

let BASE_DIR, OUTPUT_DIR, HTML_GLOB, CSS_GLOB, SCRIPTS_GLOB, WIDGET_DIR;

gulp.task( 'ubershit', () => {
    // BASE_DIR = args.directory;
    // WIDGET_DIR = `${args.directory}/widgets`;
    // OUTPUT_DIR = `${args.directory}/dist`;

    BASE_DIR = '/Users/josh/Library/Application\ Support/ubershit';
    WIDGET_DIR = `/Users/josh/Library/Application\ Support/ubershit/widgets`;
    OUTPUT_DIR = `/Users/josh/Library/Application\ Support/ubershit/dist`;

    console.log( `gulp widget directory: ${WIDGET_DIR}` );
    console.log( `gulp output directory: ${OUTPUT_DIR}` );

    HTML_GLOB = `${WIDGET_DIR}/**/**/*.html`;
    CSS_GLOB = ['internal/css/reset.scss', 'internal/css/defaults.scss', `${WIDGET_DIR}/**/**/*.scss`];
    SCRIPTS_GLOB = ['internal/scripts/command.js', `${WIDGET_DIR}/**/*.js`];

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
    console.log( 'cleaning up dist directory' );
    del( `${OUTPUT_DIR}/**`, `!${OUTPUT_DIR}` );
});


// Make the widgets directory if it doesn't exist:
if( !fs.existsSync( widgetDirectory ) ) {
    fs.mkdir( widgetDirectory, ( err ) => {
        if( err ) {
            console.log( err );
            return;
        }
    });
}

// Make the dist directory if it doesn't exist:
if( !fs.existsSync( distDirectory ) ) {
    fs.mkdir( distDirectory, ( err ) => {
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


// fs.symlink( '/usr/local/bin/gulp', '/usr/bin/gulp', ( err ) => {
//     console.log( 'error symlinking usr/local/bin/gulp: ', err );
// });

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
        // type: 'desktop',
        // transparent: true,
        // frame: false,
        // resizable: false,
        // movable: false,
        // width: size.width,
        // height: size.height
        width: 500,
        height: 600
    });

    mainWindow.loadURL( `file://${distDirectory}/index.html` );

    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on( 'did-finish-load', () => {
        mainWindow.webContents.send( 'ping', 'opening message!' );
    });

    const watcher = chokidar.watch( `${distDirectory}`, {
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

    const cleanString = ( str ) => {
        if( typeof str === 'string' ) {
            return str.replace(/(\r\n|\n|\r)/gm,"");
        } else {
            return 'NA';
        }
    };

    gulp.start( 'ubershit' );
    // exec( `gulp ubershit --directory='${ubershitDirectory}'`, ( err, stdout, stderr ) => {
    //     // mainWindow.webContents.on( 'did-finish-load', () => {
    //         err = cleanString( err );
    //         stdout = cleanString( stdout );
    //         stderr = cleanString( stderr );
    //         mainWindow.webContents.executeJavaScript( 'console.log(\"err: ' + err + '\")' );
    //         mainWindow.webContents.executeJavaScript( 'console.log(\"stdout: ' + stdout + '\")' );
    //         mainWindow.webContents.executeJavaScript( 'console.log(\"stderr: ' + stderr + '\")' );
    //     // });
    // });

    mainWindow.on( 'closed', function() {
        mainWindow = null;
    });
});
