import osascript from 'osascript';

window.commands = {};

window.command = function( file, callback, interval ) {
    if( commands.hasOwnProperty( file ) ) {
        console.log( 'clearing interval' );
        clearInterval( commands[file] );
    }

    commands[file] = setInterval( () => {
        osascript.file( file, callback );
    }, interval );
};
