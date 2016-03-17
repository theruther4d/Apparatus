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

    // const watcher = chokidar.watch( `${distDirectory}`, {
    //     ignoreInitial: true,
    //     persistent: true
    // });
    //
    // watcher
    //     .on( 'change', ( path ) => {
    //         console.log( 'reloading' );
    //         mainWindow.reload();
    //     })
    //     .on( 'add', ( path ) => {
    //         console.log( 'reloading' );
    //         mainWindow.reload();
    //     });

    const cleanString = ( str ) => {
        if( typeof str === 'string' ) {
            return str.replace(/(\r\n|\n|\r)/gm,"");
        } else {
            return 'NA';
        }
    };

    exec( `gulp ubershit --directory='${ubershitDirectory}'`, ( err, stdout, stderr ) => {
        // mainWindow.webContents.on( 'did-finish-load', () => {
            err = cleanString( err );
            stdout = cleanString( stdout );
            stderr = cleanString( stderr );
            mainWindow.webContents.executeJavaScript( 'console.log(\"err: ' + err + '\")' );
            mainWindow.webContents.executeJavaScript( 'console.log(\"stdout: ' + stdout + '\")' );
            mainWindow.webContents.executeJavaScript( 'console.log(\"stderr: ' + stderr + '\")' );
        // });
    });

    mainWindow.on( 'closed', function() {
        mainWindow = null;
    });
});
