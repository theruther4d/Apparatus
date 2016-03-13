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

// Make the node_modules directory if it doesn't exist:
if( !fs.existsSync( npmDirectory) ) {
    fs.mkdir( npmDirectory, ( err ) => {
        // Symlink the babel-preset-es2015 module:
        fs.symlink( `${__dirname}/node_modules/babel-preset-es2015`, `${npmDirectory}/babel-preset-es2015`, ( err ) => {
            if( err ) {
                console.log( err );
            }
        });
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

    exec( `gulp ubershit --directory='${ubershitDirectory}'`, ( err, stdout, stderr ) => {
        console.log( stdout );
    });

    mainWindow.on( 'closed', function() {
        mainWindow = null;
    });
});
