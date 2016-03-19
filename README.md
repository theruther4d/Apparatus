# Ubershit
A mac app that let's you create and display widgets on your desktop. Build widgets using web languages that you already know and love, so you can focus on having fun.

## [Download](https://github.com/theruther4d/Ubershit/releases/download/0.2.0/ubershit-darwin-x64.0.2.0.zip)

## Creating Widgets
Ubershit compiles all `.html`, `.css`, and `.js` files from the `widgets` directory. The recommended setup is to symlink your widget's output directory to the Ubershit `widgets` directory. When distributing to users, you can package the output directory and name it after your widget. Users will drop the folder into their `widget` directory. Use whatever build tools, processes, and languages you like. As long as it compiles to valid `html`, `css`, or `javascript` you're all set. A typical file tree for a widget named 'playbox' may look like this:

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

### Public Methods:
There are a few useful public methods exposed as global variables.
#### `command( file, callback, interval )`:
A wrapper around [`node-osascript`](https://www.npmjs.com/package/node-osascript).  Takes a file containing osascript and executes it every number of milliseconds provided.
* `@param {string} file` - The file to read from. Either applescript or javascript.
* `@param {function} callback` - Receives `error` and `response` as arguments.
* `@param {integer} interval` - The number of milliseconds to wait until re-executing.

Example usage:
```javascript
command( `${WIDGET_DIR}/playbox/as/getTrack.applescript`, ( err, res ) => {
    ...
}, 1000 );
```

#### `Blur( el )`:
A class for creating blurred backgrounds. Takes a wrapper element an appends a `<canvas>` with the portion of the desktop that sits behind the wrapper element.
* `@param {DOM node} el` - The element to measure and append the `<canvas>` to.

Example usage:
```javascript
const myBlur = new Blur( myWrapper );
```
```css
    .myWrapper {
        position: relative;
        z-index: 1;

        canvas {
            position: absolute;
            top: -10px;
            right: -10px;
            z-index: -1;
            -webkit-filter: blur( 10px );
        }
    }
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
