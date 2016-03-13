'use strict';
// import osascript from 'osascript';
// import childProcess from 'child_process';
// import fs from 'fs';
// const osascript = require( 'osascript' );
// const exec = require( 'child_process' ).exec;
// const fs = require( 'fs' );

var electron = require('electron');
var remote = electron.remote;
var Menu = remote.Menu;
var MenuItem = remote.MenuItem;
var shell = electron.shell;

var template = [{
  label: 'Edit',
  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: 'View',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function click(item, focusedWindow) {
      if (focusedWindow) focusedWindow.reload();
    }
  }, {
    label: 'Toggle Full Screen',
    accelerator: function () {
      if (process.platform == 'darwin') return 'Ctrl+Command+F';else return 'F11';
    }(),
    click: function click(item, focusedWindow) {
      if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
    }
  }, {
    label: 'Show Widgets Folder',
    accelerator: function () {
      if (process.platform == 'darwin') return 'Ctrl+Command+W';else return 'F11';
    }(),
    click: function click(item, focusedWindow) {
      if (focusedWindow) {
        shell.showItemInFolder('/Users/josh/Library/Application Support/ubershit/widgets');
      }
    }
  }, {
    label: 'Toggle Developer Tools',
    accelerator: function () {
      if (process.platform == 'darwin') return 'Alt+Command+I';else return 'Ctrl+Shift+I';
    }(),
    click: function click(item, focusedWindow) {
      if (focusedWindow) focusedWindow.toggleDevTools();
    }
  }]
}, {
  label: 'Window',
  role: 'window',
  submenu: [{
    label: 'Minimize',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: 'Close',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
}, {
  label: 'Help',
  role: 'help',
  submenu: [{
    label: 'Learn More',
    click: function click() {
      require('electron').shell.openExternal('http://electron.atom.io');
    }
  }]
}];

// @TODO: we're only packaging for darwin
if (process.platform == 'darwin') {
  var name = require('electron').remote.app.getName();
  template.unshift({
    label: name,
    submenu: [{
      label: 'About ' + name,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: 'Hide ' + name,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: function click() {
        remote.app.quit();
      }
    }]
  });
  // Window menu.
  template[3].submenu.push({
    type: 'separator'
  }, {
    label: 'Bring Window to Front',
    role: 'front'
  });
};
var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// const exec = childProcess.exec;

// let commands = {};
// let execs = {};
//
// window.command = function( file, callback, interval ) {
//     if( commands.hasOwnProperty( file ) ) {
//         clearInterval( commands[file] );
//     }
//
//     commands[file] = setInterval( () => {
//         osascript.file( file, callback );
//     }, interval );
// };
//
// window.execFromFile = function( file, callback, interval ) {
//     if( execs.hasOwnProperty( file ) ) {
//         clearInterval( execs[file] );
//     }
//
//     execs[file] = setInterval( () => {
//         return exec( fs.readFileSync( file ), callback );
//     }, interval );
// };
//
// module.exports = command;