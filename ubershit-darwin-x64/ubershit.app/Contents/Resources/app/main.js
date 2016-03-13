'use strict';

const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const exec = require( 'child_process' ).exec;
const chokidar = require( 'chokidar' );
const fs = require( 'fs' );
const widgetDirectory = `${app.getPath( 'userData' )}/widgets`;

// Make the widgets directory if it doesn't exist:
if( !fs.existsSync( widgetDirectory ) ) {
    console.log( 'making widget directory' );
    fs.mkdir( widgetDirectory, ( err ) => {
        console.log( err );
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

    mainWindow.loadURL( 'file://' + __dirname + '/dist/index.html' );

    const watcher = chokidar.watch( `${widgetDirectory}`, {
        ignoreInitial: true,
        persistent: true
    });
    console.log( `watching ${widgetDirectory}` );

    watcher
        .on( 'change', ( path ) => {
            console.log( 'changed' );
            mainWindow.setSize( 100, 100, true );
            mainWindow.reload();
        })
        .on( 'add', ( path ) => {
            console.log( 'added' );
            mainWindow.setSize( 100, 100, true );
            mainWindow.reload();
        });

    exec( 'gulp', ( err, stdout, stderr ) => {
        console.log( stdout );
    });

    mainWindow.on( 'closed', function() {
        mainWindow = null;
    });
});
