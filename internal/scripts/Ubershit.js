const electron = require( 'electron' );
const remote = electron.remote;
const app = remote.app;
const Tray = remote.Tray;
const shell = remote.shell;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
window.contextMenu;

class Ubershit {
    constructor() {
        this._events = {};
        this.on( 'ready', this._createTray.bind( this ) );
    }

    /*
     * Check if this instance contains an event by name.
    */
    _hasEvent( eventName ) {
        return this._events.hasOwnProperty( eventName );
    }


    /*
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


    /*
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
};

window.ubershit = new Ubershit();
