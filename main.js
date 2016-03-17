'use strict';

// Electron:
const electron = require( 'electron' );
const app = electron.app;
const Tray = electron.Tray;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;

// Dependencies:
const exec = require( 'child_process' ).exec;
const chokidar = require( 'chokidar' );
const fs = require( 'fs' );
const gulp = require( 'gulp' );
const concat = require( 'gulp-concat' );
const rename = require( 'gulp-rename' );
const insert = require( 'gulp-insert' );
const replace = require( 'gulp-replace' );
const runSequence = require( 'run-sequence' );
const watch = require( 'gulp-watch' );

// pre-delcare navIcon so it's not GC'd later:
let navIcon, mainWindow;

// Path constants:
const BASE_DIR = app.getPath( 'userData' );
const WIDGET_DIR = `${BASE_DIR}/widgets`;
const OUTPUT_DIR = `${BASE_DIR}/dist`;
const NPM_DIR = `${BASE_DIR}/node_modules`;

// File Globs
const HTML_GLOB = `${WIDGET_DIR}/**/**/dist/*.html`;
const CSS_GLOB = [/*'internal/css/reset.scss', 'internal/css/defaults.scss',*/ `${WIDGET_DIR}/**/**/dist/*.scss`];
const SCRIPTS_GLOB = [/*'internal/scripts/command.js', */ `${WIDGET_DIR}/**/**/dist/*.js`];

// Gulp tasks:
gulp.task( 'ubershit', () => {
    runSequence( ['html', 'css', 'scripts'], 'stream' );
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
    // console.log( `html outputting to ${OUTPUT_DIR}` );
    return gulp.src( HTML_GLOB )
        .pipe( concat( 'index.html' ) )
        // .pipe( insert.prepend( fs.readFileSync( `${__dirname}/internal/html/head.html` ) ) )
        // .pipe( insert.append( fs.readFileSync( `${__dirname}/internal/html/foot.html` ) ) )
        .pipe( replace( 'WIDGET_DIR', BASE_DIR ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'css', () => {
    // console.log( `css outputting to ${OUTPUT_DIR}` );
    return gulp.src( CSS_GLOB )
        .pipe( concat( 'style.scss' ) )
        .pipe( rename( 'style.css' ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'scripts', () => {
    // console.log( `scripts outputting to ${OUTPUT_DIR}` );
    return gulp.src( SCRIPTS_GLOB )
        .pipe( concat( 'scripts.js' ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
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
            'gulp',
            'gulp-concat',
            'gulp-insert',
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
    const size = electronScreen.getPrimaryDisplay().workAreaSize;

    // Menu:
    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Widgets Folder',
            type: 'normal',
            click: ( item, window ) => {
                shell.showItemInFolder( WIDGET_DIR );
            }
        },
        {
            label: 'Show Debug Console',
            type: 'checkbox',
            checked: false,
            click: ( item, window ) => {
                const currWindow = mainWindow || window;
                if( !currWindow ) {
                    return;
                }

                const action = item.checked ? 'openDevTools' : 'closeDevTools';
                currWindow.webContents[action]();
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit Ubershit',
            type: 'normal',
            accelerator: 'Command+Q',
            click: ( item, window ) => {
                app.quit();
            }
        }
    ]);

    // Create the notification bar icon:
    navIcon = new Tray( `${__dirname}/internal/images/dummy-icon.png` );
    navIcon.setToolTip( 'Ubershit' );
    navIcon.setContextMenu( contextMenu );

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
