'use strict';

// Electron:
const electron = require( 'electron' );
const app = electron.app;
const Tray = electron.Tray;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;

// Dependencies:
const chokidar = require( 'chokidar' );
const fs = require( 'fs' );
const gulp = require( 'gulp' );
const concat = require( 'gulp-concat' );
const rename = require( 'gulp-rename' );
// const insert = require( 'gulp-insert' );
const replace = require( 'gulp-replace' );
const runSequence = require( 'run-sequence' );
const watch = require( 'gulp-watch' );

// pre-delcare mainWindow so it's not GC'd later:
let mainWindow;

// Path constants:
const BASE_DIR = app.getPath( 'userData' );
const WIDGET_DIR = `${BASE_DIR}/widgets`;
const OUTPUT_DIR = `${BASE_DIR}/dist`;
const NPM_DIR = `${BASE_DIR}/node_modules`;

const mkDirIfNotExists = ( directory ) => {
    if( !fs.existsSync( directory ) ) {
        fs.mkdir( directory, ( err ) => {
            if( err ) {
                console.log( err );
                return;
            }
        });
    }
};

// Make the WIDGET_DIR and OUTPUT_DIR if they don't exist:
mkDirIfNotExists( WIDGET_DIR );
mkDirIfNotExists( OUTPUT_DIR );

const getWidgets = () => {
    let widgets = [];
    const foundWidgets = fs.readdirSync( WIDGET_DIR );

    foundWidgets.forEach( ( widget ) => {
        if( widget.charCodeAt( 0 ) !== 46 ) {
            widgets.push( widget );
        }
    });

    return widgets;
};

const generateWidgetBlobs = ( widgets, blob ) => {
    let blobs = [];
    widgets.forEach( ( widget ) => {
        blobs.push( `${WIDGET_DIR}/${widget}/${blob}` );
    });

    return blobs;
};

// File Globs
const widgets = getWidgets();
const HTML_GLOB = [`${__dirname}/includes/html/head.html`, ...generateWidgetBlobs( widgets, '*.html' ), `${__dirname}/includes/html/foot.html`];
const CSS_GLOB = [`${__dirname}/includes/css/style.css`, ...generateWidgetBlobs( widgets, '*.css' )];
const SCRIPTS_GLOB = [`${__dirname}/includes/scripts/scripts.js`, ...generateWidgetBlobs( widgets, '*.js' )];
const IMAGE_GLOB = `${__dirname}/includes/images/*`;

// Gulp tasks:
gulp.task( 'apparatus', () => {
    runSequence( ['html', 'css', 'scripts', 'images'], 'stream' );
});

gulp.task( 'stream', () => {
    watch( HTML_GLOB, ( e ) => {
        gulp.start( 'html' );
    });

    watch( CSS_GLOB, ( e ) => {
        gulp.start( 'css' );
    });

    watch( SCRIPTS_GLOB, ( e ) => {
        gulp.start( 'scripts' );
    });
});

gulp.task( 'html', () => {
    return gulp.src( HTML_GLOB )
        .pipe( concat( 'index.html' ) )
        .pipe( replace( 'WIDGET_DIR', BASE_DIR ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'css', () => {
    return gulp.src( CSS_GLOB )
        .pipe( concat( 'style.scss' ) )
        .pipe( rename( 'style.css' ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'scripts', () => {
    return gulp.src( SCRIPTS_GLOB )
        .pipe( concat( 'scripts.js' ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'images', () => {
    return gulp.src( IMAGE_GLOB )
        .pipe( gulp.dest( `${OUTPUT_DIR}/images` ) )
});

const makeNodeModuleSymlinks = ( modules ) => {
    modules.forEach( ( module ) => {
        fs.symlink( `${__dirname}/node_modules/${module}`, `${NPM_DIR}/${module}`, ( err ) => {
            if( err ) {
                console.log( `error symlinking module: ${module}: `, err );
            }
        });
    });
};

// Make the node_modules directory if it doesn't exist:
if( !fs.existsSync( NPM_DIR) ) {
    fs.mkdir( NPM_DIR, ( err ) => {
        makeNodeModuleSymlinks([
            'osascript',
            'ffi',
            'nodobjc',
            'gulp',
            'gulp-concat',
            // 'gulp-insert',
            'gulp-rename',
            'gulp-replace',
            'gulp-run-sequence',
        ]);
    });
}

app.on( 'window-all-closed', () => {
    if( process.platform != 'darwin' ) {
        // quit gulp?
        app.quit();
    }
});

app.on( 'ready', () => {
    const electronScreen = electron.screen;
    // const size = electronScreen.getPrimaryDisplay().workAreaSize;
    const size = electronScreen.getPrimaryDisplay().bounds;
    // console.log( electronScreen.getPrimaryDisplay().bounds );
    // console.log( electronScreen.getPrimaryDisplay().workAreaSize );
    // Hide the dock icon:
    app.dock.hide();

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

    mainWindow.webContents.on( 'did-finish-load', () => {
        console.log( 'loaded' );
        mainWindow.webContents.executeJavaScript( `apparatus.trigger( 'ready' );` );
        let watcher = chokidar.watch( `${OUTPUT_DIR}`, {
            ignoreInitial: true,
            persistent: true
        });

        watcher.on( 'all', ( path ) => {
            mainWindow.webContents.executeJavaScript( `apparatus.trigger( 'willReload' );` );
            reload();
        });

        function reload() {
            console.log( 'reloading' );
            mainWindow.reload();
            watcher.close();
            watcher = null;
        };
    });

    gulp.start( 'apparatus' );

    mainWindow.on( 'close', () => {
        mainWindow.webContents.executeJavaScript( `window.navIcon.destroy(); window.navIcon = null` );
    });

    mainWindow.on( 'closed', function() {
        mainWindow = null;
    });
});
