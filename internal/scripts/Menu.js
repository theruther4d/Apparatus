// @TODO:
// need a path to includes/images for tray icon

const electron = require( 'electron' );
const remote = electron.remote;
const app = remote.app;
const Tray = remote.Tray;

// if( typeof window.navIcon == 'undefined' ) {
//     window.navIcon = new Tray( `${__dirname}/iconTemplate.png` );
//     console.log( 'creating tray icon' );
// } else {
//     console.log( 'window.navIcon already exists!' );
// }
//
// navIcon.setToolTip( 'Ubershit' );

// window.onbeforeunload( () => {
//     alert( 'about to unload!' );
//     window.navIcon = null;
// });

const createTray = () => {
    alert( 'creating tray!' );
    window.navIcon = new Tray( `${__dirname}/iconTemplate.png` );
};
