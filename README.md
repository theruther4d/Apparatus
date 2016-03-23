# Ubershit
The *other* mac app that lets you create and display widgets on your desktop. Build widgets using web languages that you already know and love, so you can focus on having fun.

## [Download](https://github.com/theruther4d/Ubershit/releases/download/0.2.0/ubershit-darwin-x64.0.2.0.zip)

## Creating Widgets
Ubershit compiles all `.html`, `.css`, and `.js` files from the `widgets` (`$user/Library/Application Support/ubershit/widgets`) directory. The recommended setup during development is to symlink your widget's output directory to the Ubershit `widgets` directory. When distributing, you can package the output directory and name it after your widget. Users will drop the folder into their `widget` directory. Use whatever build tools, processes, and languages you like. As long as it compiles to valid `html`, `css`, or `javascript` you're all set. A typical file tree for a widget named 'playbox' may look like this:

```
.
├── css
|   ├── somefile.scss
|   └── somefile.scss
|   └── somefile.scss
├── gulpfile.js
├── index.haml
├── package.json
├── node_modules
|   └── ...
├── playbox             // compiled output
|   ├── index.html
|   └── scripts.js
|   └── style.css
├── scripts
|   ├── somefile.js
|   └── somefile.js

```

### Public Properties and Methods:
The `ubershit` instance exposes a few helpful methods and properties to widgets.

#### `WIDGET_DIR`
A constant containing the path to the widget directory.

Usage:
```javascript
myImg.src = `${ubershit.WIDGET_DIR}/playbox/images/default.png`;
```

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

#### `addToMenu( namespace, items )`
  * `namespace` string - the name of your widget. Items added will sit in the menu under this string.
  * `items` array - an array of objects, corresponds directly to [electron's MenuItem class.](https://github.com/atom/electron/blob/master/docs/api/menu-item.md)

Usage:
```javascript
ubershit.addToMenu( 'playbox', [
    {
        label: 'Item1',
        click: ( menuItem, browserWindow ) => {
            // do something
        }
    },
    {
        label: 'Item2',
        type: 'checkbox',
        checked: false,
        click: ( menuItem, browserWindow ) => {
            // do something
        }
    }
]);
```

#### `command( file, callback, interval )`:
A wrapper around [`node-osascript`](https://www.npmjs.com/package/node-osascript).  Takes a file containing osascript and executes it every number of milliseconds provided.
* `file` string - The file to read from. Either applescript or javascript.
* `callback` function - Receives `error` and `response` as arguments.
* `interval` integer - The number of milliseconds to wait until re-executing.

Usage:
```javascript
ubershit.command( `${WIDGET_DIR}/playbox/as/getTrack.applescript`, ( err, res ) => {
    // do something
}, 1000 );
```

#### `Blur( el, amt )`:
A class for creating blurred backgrounds. Takes a wrapper element an appends a `<canvas>` with the portion of the desktop that sits behind the wrapper element.
* `el` DOM node - The element to measure and append the `<canvas>` to.
* `amt` integer - The amount of blur to apply to the background, defaults to 10.

Usage:
```javascript
const myBlur = ubershit.blur( myWrapper );
```

## Building
### Clone the repo:
```sh
git clone git@github.com:theruther4d/Ubershit.git
```

### Run npm install
```sh
cd Ubershit
npm install
```
### Run in development
```sh
electron .
```

### Package for production
We're using [`electron-packager`](https://www.npmjs.com/package/electron-packager). Check out the options on [npm](https://www.npmjs.com/package/electron-packager).
```sh
npm install -g electron-packager
electron-packager ~/ubershit ubershit --platform=darwin --arch=x64 --version=0.36.10 --overwrite --ignore='/internal'
```
