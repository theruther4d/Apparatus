'use strict';
// import osascript from 'osascript';
// import childProcess from 'child_process';
// import fs from 'fs';
const osascript = require( 'osascript' );
const exec = require( 'child_process' ).exec;
const fs = require( 'fs' );


// const exec = childProcess.exec;

let commands = {};
let execs = {};

window.command = function( file, callback, interval ) {
    if( commands.hasOwnProperty( file ) ) {
        clearInterval( commands[file] );
    }

    commands[file] = setInterval( () => {
        osascript.file( file, callback );
    }, interval );
};

window.execFromFile = function( file, callback, interval ) {
    if( execs.hasOwnProperty( file ) ) {
        clearInterval( execs[file] );
    }

    execs[file] = setInterval( () => {
        return exec( fs.readFileSync( file ), callback );
    }, interval );
};

module.exports = command;
