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
const insert = require( 'gulp-insert' );
const replace = require( 'gulp-replace' );
const runSequence = require( 'run-sequence' );
const watch = require( 'gulp-watch' );

// pre-delcare navIcon so it's not GC'd later:
let /*navIcon, */mainWindow;

// Path constants:
const BASE_DIR = app.getPath( 'userData' );
const WIDGET_DIR = `${BASE_DIR}/widgets`;
const OUTPUT_DIR = `${BASE_DIR}/dist`;
const NPM_DIR = `${BASE_DIR}/node_modules`;

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

// const generateWidgetMenus = ( widgets ) => {
//     let menuItems = [];
//
//     widgets.forEach( ( widget ) => {
//         const widgetManifest = `${WIDGET_DIR}/${widget}/package.json`;
//         if( fs.existsSync( widgetManifest ) ) {
//             const widgetOptions = fs.readFileSync( `${WIDGET_DIR}/${widget}/package.json` );
//             console.log( widgetOptions );
//             // let widgetMenu = {};
//         }
//     });
// };
// generateWidgetMenus( widgets );

// File Globs
const widgets = getWidgets();
const HTML_GLOB = generateWidgetBlobs( widgets, '*.html' );
const CSS_GLOB = [`${__dirname}/includes/css/style.css`, ...generateWidgetBlobs( widgets, '*.css' )];
const SCRIPTS_GLOB = [`${__dirname}/includes/scripts/scripts.js`, ...generateWidgetBlobs( widgets, '*.js' )];

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
    return gulp.src( HTML_GLOB )
        .pipe( concat( 'index.html' ) )
        .pipe( insert.prepend( fs.readFileSync( `${__dirname}/includes/html/head.html` ) ) )
        .pipe( insert.append( fs.readFileSync( `${__dirname}/includes/html/foot.html` ) ) )
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
            'nodobjc',
            'ffi',
            'path',
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
    // const contextMenu = Menu.buildFromTemplate([
    //     {
    //         label: 'Open Widgets Folder',
    //         type: 'normal',
    //         click: ( item, window ) => {
    //             shell.showItemInFolder( WIDGET_DIR );
    //         }
    //     },
    //     {
    //         label: 'Show Debug Console',
    //         type: 'checkbox',
    //         checked: false,
    //         click: ( item, window ) => {
    //             const currWindow = mainWindow || window;
    //             if( !currWindow ) {
    //                 return;
    //             }
    //
    //             const action = item.checked ? 'openDevTools' : 'closeDevTools';
    //             currWindow.webContents[action]({
    //                 detach: true
    //             });
    //         }
    //     },
    //     {
    //         type: 'separator'
    //     },
    //     {
    //         label: 'Quit Ubershit',
    //         type: 'normal',
    //         accelerator: 'Command+Q',
    //         click: ( item, window ) => {
    //             app.quit();
    //         }
    //     }
    // ]);

    // Create the notification bar icon:
    // navIcon.setContextMenu( contextMenu );

    // Hide the dock icon:
    // app.dock.hide();

    mainWindow = new BrowserWindow({
        // type: 'desktop',
        // transparent: true,
        // frame: false,
        // resizable: false,
        // movable: false,
        width: size.width,
        height: size.height
    });

    // navIcon = new Tray( `${__dirname}/includes/images/iconTemplate.png` );
    // navIcon.setToolTip( 'Ubershit' );
    // navIcon.on( 'click', ( e, bounds ) => {
    //     console.log( e );
    //     console.log( bounds );
    //     mainWindow.webContents.executeJavaScript( `window.toggleContextMenu( ` + bounds + ` )` );
    // });

    mainWindow.loadURL( `file://${OUTPUT_DIR}/index.html` );
    // mainWindow.webContents.executeJavaScript( `console.log( '${WIDGET_DIR}' )` );
    mainWindow.webContents.executeJavaScript( `createTray()` );
    // mainWindow.openDevTools();

    const watcher = chokidar.watch( `${OUTPUT_DIR}`, {
        ignoreInitial: true,
        persistent: true
    });

    watcher
        .on( 'change', ( path ) => {
            mainWindow.reload();
        })
        .on( 'add', ( path ) => {
            mainWindow.reload();
        });

    gulp.start( 'ubershit' );

    mainWindow.on( 'close', () => {
        mainWindow.webContents.executeJavaScript( `window.navIcon.destroy(); window.navIcon = null` );
    });

    mainWindow.on( 'closed', function() {
        mainWindow = null;
    });
});
