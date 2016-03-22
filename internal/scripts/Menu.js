// // @TODO:
// // * need a path to includes/images for tray icon
// // * Maybe we wrap the entire concatenated code inside of a function that is triggered when the app is ready
// // -- OR --
// // * We provide a function that tells clientside code when the app is ready ?
//
// const electron = require( 'electron' );
// const remote = electron.remote;
// const app = remote.app;
// const Tray = remote.Tray;
// const shell = remote.shell;
// const Menu = remote.Menu;
// const MenuItem = remote.MenuItem;
// window.contextMenu;
//
// ubershit.on( 'ready', () => {
//     _createTray();
// });
//
// const _createTray = () => {
//     // Menu:
//     window.contextMenu = Menu.buildFromTemplate([
//         {
//             label: 'Open Widgets Folder',
//             type: 'normal',
//             click: ( item, currWindow ) => {
//                 // console.log( window.WIDGET_DIR );
//                 shell.showItemInFolder( window.WIDGET_DIR );
//             }
//         },
//         {
//             label: 'Show Debug Console',
//             type: 'checkbox',
//             checked: false,
//             click: ( item, currWindow ) => {
//                 // const currWindow = mainWindow || window;
//                 if( !currWindow ) {
//                     return;
//                 }
//
//                 const action = item.checked ? 'openDevTools' : 'closeDevTools';
//                 currWindow.webContents[action]({
//                     detach: true
//                 });
//             }
//         },
//         {
//             type: 'separator'
//         },
//         {
//             label: 'Quit Ubershit',
//             type: 'normal',
//             accelerator: 'Command+Q',
//             click: ( item, currWindow ) => {
//                 app.quit();
//             }
//         }
//     ]);
//
//     // Create the notification bar icon:
//     window.navIcon = new Tray( `${__dirname}/iconTemplate.png` );
//     window.navIcon.setContextMenu( contextMenu );
// };
