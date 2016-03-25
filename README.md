# Apparatus
The *other* mac app that lets you create and display widgets on your desktop. Build widgets using web languages that you already know and love, so you can focus on having fun.

## [Download](https://github.com/theruther4d/Apparatus/releases/download/0.2.0/apparatus-darwin-x64.0.2.0.zip)

## Creating Widgets
Apparatus compiles all `.html`, `.css`, and `.js` files from the `widgets` (`$user/Library/Application Support/apparatus/widgets`) directory. The recommended setup during development is to symlink your widget's output directory to the Apparatus `widgets` directory. When distributing, you can package the output directory and name it after your widget. Users will drop the folder into their `widget` directory. Use whatever build tools, processes, and languages you like. As long as it compiles to valid `html`, `css`, or `javascript` you're all set. A typical file tree for a widget named 'playbox' may look like this:

```
.
├── css
|   ├── somefile.scss
|   └── someOtherFile.scss
|   └── evenAnotherFile.scss
├── gulpfile.js
├── index.haml
├── package.json
├── node_modules
|   └── ...
|
|
| // compiled output /playbox is symlinked
├── playbox
|   ├── index.html
|   └── scripts.js
|   └── style.css
|
|
├── scripts
|   ├── somefile.js
|   └── somefile.js

```

### Public Properties and Methods:
The `apparatus` instance exposes a few helpful methods and properties to widgets.

#### `Preference( name, initialValue, callback, persistent = true)`
Not under the apparatus namespace. A class for handling user preferences. Defaults to persistent (value will remain even after the application is closed.)
* `name` - the name you'll use to set and retrieve the preference.
* `initialValue` - the value that will be used if the user hasn't set this preference before.
* `callback` - triggered when the value of the preference changes. Receives `newValue` as a parameter.
* `persistent` - defaults to `true`. Set to `false` if you want the preference to behave as a session variable.

Usage:
```javascript
// For example, in a calendar widget, we create a preference to store
// which day of the week the calendar should start with:
this._startWeekDay = new Preference( 'startWeekDay', 'Sunday', function( newValue ) {
    // This will re-run any time the value of the preference changes:
    this._createCalendar();
}.bind( this ) );

// We add the control to the menu that handles changing this value:
apparatus.addToMenu( 'calendar', [
    {
        label: 'Start week on Monday',
        type: 'checkbox',
        checked: this._startWeekDay.value === 'Monday',
        click: ( item ) => {
            this._startWeekDay.value = item.checked ? 'Monday' : 'Sunday';
        }
    }
])
```
---  


#### `WIDGET_DIR`
A constant containing the path to the widget directory.

Usage:
```javascript
myImg.src = `${apparatus.WIDGET_DIR}/playbox/images/default.png`;
```
---  

#### `browserWindow`
An electron [`browserWindow`](https://github.com/atom/electron/blob/master/docs/api/browser-window.md) instance. Useful in `menuItem` click callbacks.

Usage:
```javascript
click: ( item ) => {
    const action = item.checked ? 'openDevTools' : 'closeDevTools';

    this.browserWindow.webContents[action]({
        detach: true
    });
}
```
---  

#### `addToMenu( namespace, items )`
Adds your widget menu items to the tray context menu.
  * `namespace` string - the name of your widget. Items added will sit in the menu under this string.
  * `items` array - an array of objects, corresponds directly to [electron's MenuItem class.](https://github.com/atom/electron/blob/master/docs/api/menu-item.md)

Usage:
```javascript
apparatus.addToMenu( 'playbox', [
    {
        label: 'Item1',
        click: ( menuItem ) => {
            // do something
        }
    },
    {
        label: 'Item2',
        type: 'checkbox',
        checked: false,
        click: ( menuItem ) => {
            // do something
        }
    }
]);
```
---  

#### `command( file, callback, interval )`:
A wrapper around [`node-osascript`](https://www.npmjs.com/package/node-osascript).  Takes a file containing osascript and executes it every number of milliseconds provided.
* `file` string - The file to read from. Either applescript or javascript.
* `callback` function - Receives `error` and `response` as arguments.
* `interval` integer - The number of milliseconds to wait until re-executing.

Usage:
```javascript
apparatus.command( `${WIDGET_DIR}/playbox/as/getTrack.applescript`, ( err, res ) => {
    // do something
}, 1000 );
```
---  

#### `exec( command, options, callback)`:
A wrapper around node [`child_processes.exec`](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback).
* `command` string - Shell command to execute.
* `options` object - See the [node documentation](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) for more info.
* `callback` function - Receives `error` and `response` as arguments.

Usage:
```javascript
apparatus.exec( 'pwd', ( err, res ) => {
    // do something
});
```
---  

#### `Blur( el, amt )`:
A class for creating blurred backgrounds. Takes a wrapper element an appends a `<canvas>` with the portion of the desktop that sits behind the wrapper element.
* `el` DOM node - The element to measure and append the `<canvas>` to.
* `amt` integer - The amount of blur to apply to the background, defaults to 10.

Usage:
```javascript
const myBlur = apparatus.blur( myWrapper );
```
---  

## Building
##### 1. Clone the repo:
```sh
git clone git@github.com:theruther4d/Apparatus.git
```

##### 2. Run npm install
```sh
cd Apparatus
npm install
```
##### 3. Run in development
```sh
electron .
```

##### 4. Package for production
We're using [`electron-packager`](https://www.npmjs.com/package/electron-packager). Check out the options on [npm](https://www.npmjs.com/package/electron-packager).
```sh
npm install -g electron-packager
electron-packager ~/apparatus apparatus --platform=darwin --arch=x64 --version=0.36.10 --overwrite --ignore='/internal'
```
