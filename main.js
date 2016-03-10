'use strict';

const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const exec = require( 'child_process' ).exec;
const chokidar = require( 'chokidar' );

var mainWindow = null;

app.on( 'window-all-closed', function() {
    if( process.platform != 'darwin' ) {
        // quit gulp?
        app.quit();
    }
});

app.on( 'ready', function() {
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

    mainWindow.loadURL( 'file://' + __dirname + '/dist/index.html' );

    const watcher = chokidar.watch( `${__dirname}/dist/*` );
    watcher.on( 'change', ( path ) => {
        mainWindow.reload();
    });

    exec( 'gulp', ( err, stdout, stderr ) => {
        console.log( stdout );
    });

    // mainWindow.webContents.openDevTools();

    mainWindow.on( 'closed', function() {
        mainWindow = null;
    });
});
