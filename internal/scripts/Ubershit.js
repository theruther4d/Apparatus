const electron = require( 'electron' );
const remote = electron.remote;
const app = remote.app;
const Tray = remote.Tray;
const shell = remote.shell;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const osascript = require( 'osascript' );
const exec = require( 'child_process' ).exec;
const fs = require( 'fs' );

/** Ubershit Class */
class Ubershit {
    constructor() {
        this._events = {};
        this.WIDGET_DIR = this._getWidgetDirPath();
        this._commands = {};
        this._execs = {};
        this.on( 'ready', this._createTray.bind( this ) );
    }

    /**
     * Returns the widget directory path.
     */
    _getWidgetDirPath() {
        let WIDGET_DIR = __dirname.split( '/' );
        WIDGET_DIR.splice( -1, 1 );
        WIDGET_DIR = `${WIDGET_DIR.join( '/' )}/widgets`
        return WIDGET_DIR;
    }

    /**
     * Check if this instance contains an event by name.
     */
    _hasEvent( eventName ) {
        return this._events.hasOwnProperty( eventName );
    }


    /**
     * Bind an event by name:
     */
    on( eventName, callBack ) {
        if( !this._hasEvent( eventName ) ) {
            this._events[eventName] = [ callBack ];
            return;
        }

        this._events[eventName].push( callBack );
    }

    /**
     * Trigger the event by name:
     */
    trigger( eventName ) {
        if( !this._hasEvent( eventName ) ) {
            return false;
        }

        this._events[eventName].forEach( ( callBack ) => {
            callBack();
        });
    }


    /**
     * Creates the tray icon and initial context menu.
     */
    _createTray() {
        // Menu:
        this.menu = Menu.buildFromTemplate([
            {
                label: 'Open Widgets Folder',
                type: 'normal',
                click: ( item, currWindow ) => {
                    shell.showItemInFolder( window.WIDGET_DIR );
                }
            },
            {
                label: 'Show Debug Console',
                type: 'checkbox',
                checked: false,
                click: ( item, currWindow ) => {
                    // const currWindow = mainWindow || window;
                    if( !currWindow ) {
                        return;
                    }

                    const action = item.checked ? 'openDevTools' : 'closeDevTools';
                    currWindow.webContents[action]({
                        detach: true
                    });
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit Ubershit',
                type: 'normal',
                accelerator: 'Command+Q',
                click: ( item, currWindow ) => {
                    app.quit();
                }
            }
        ]);

        // Create the notification bar icon:
        this._tray = new Tray( `${__dirname}/iconTemplate.png` );
        this._tray.setContextMenu( this.menu );
    }


    /**
     * Add items to the context menu.
     */
    addToMenu( namespace, items ) {
        this.on( 'ready', function() {
            this.menu.append( new MenuItem( { type: 'separator' } ) );

            const subMenu = new Menu();

            items.forEach( ( item ) => {
                const menuItem = new MenuItem( item );
                subMenu.append( menuItem );
            });

            this.menu.append( new MenuItem( { label: namespace, submenu: subMenu } ) );

            // Refresh the menu:
            this._tray.setContextMenu( this.menu );
        }.bind( this ) );
    }

    /**
     * A wrapper around osascript, executes the file at a given interval.
     *
     * @param {string} file - The file to execute. Must be valid osascript.
     * @param {function} callback - Executed after the file command, returns with params error, and response.
     * @param {integer} interval - The interval at which to re-execute the command.
     * @param {object} options - Options for npm osascript module.
     */
    command( file, callback, interval, options ) {
        options = options || {};

        if( this._commands.hasOwnProperty( file ) ) {
            clearInterval( this._commands[file] );
        }

        this._commands[file] = setInterval( () => {
            osascript.file( file, options, callback );
        }, interval );
    }

    /**
     * Executes a script from a file at a specific interval.
     *
     * @param {string} file - The file to execute. Must be valid osascript.
     * @param {function} callback - Executed after the file command, returns with params error, and response.
     * @param {integer} interval - The interval at which to re-execute the command.
     */
    execFromFile( file, callback, interval ) {
        if( this._execs.hasOwnProperty( file ) ) {
            clearInterval( this._execs[file] );
        }

        this._execs[file] = setInterval( () => {
            return exec( fs.readFileSync( file ), callback );
        }, interval );
    }

    /**
     * Makes Blur Class publicly available.
     */
    blur( el, blurAmt = 10 ) {
        return new Blur( el, blurAmt );
    }
};

window.ubershit = new Ubershit();
