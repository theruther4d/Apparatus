'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var electron = require('electron');
var remote = electron.remote;
var app = remote.app;
var Tray = remote.Tray;
var shell = remote.shell;
var Menu = remote.Menu;
var MenuItem = remote.MenuItem;
window.contextMenu;

var Ubershit = function () {
    function Ubershit() {
        _classCallCheck(this, Ubershit);

        this._events = {};
        this.on('ready', this._createTray.bind(this));
    }

    /*
     * Check if this instance contains an event by name.
    */


    _createClass(Ubershit, [{
        key: '_hasEvent',
        value: function _hasEvent(eventName) {
            return this._events.hasOwnProperty(eventName);
        }

        /*
         * Bind an event by name:
        */

    }, {
        key: 'on',
        value: function on(eventName, callBack) {
            if (!this._hasEvent(eventName)) {
                this._events[eventName] = [callBack];
                return;
            }

            this._events[eventName].push(callBack);
        }

        /**
         * Trigger the event by name:
        */

    }, {
        key: 'trigger',
        value: function trigger(eventName) {
            if (!this._hasEvent(eventName)) {
                return false;
            }

            this._events[eventName].forEach(function (callBack) {
                callBack();
            });
        }

        /**
         * Creates the tray icon and initial context menu.
        */

    }, {
        key: '_createTray',
        value: function _createTray() {
            // Menu:
            this.menu = Menu.buildFromTemplate([{
                label: 'Open Widgets Folder',
                type: 'normal',
                click: function click(item, currWindow) {
                    shell.showItemInFolder(window.WIDGET_DIR);
                }
            }, {
                label: 'Show Debug Console',
                type: 'checkbox',
                checked: false,
                click: function click(item, currWindow) {
                    // const currWindow = mainWindow || window;
                    if (!currWindow) {
                        return;
                    }

                    var action = item.checked ? 'openDevTools' : 'closeDevTools';
                    currWindow.webContents[action]({
                        detach: true
                    });
                }
            }, {
                type: 'separator'
            }, {
                label: 'Quit Ubershit',
                type: 'normal',
                accelerator: 'Command+Q',
                click: function click(item, currWindow) {
                    app.quit();
                }
            }]);

            // Create the notification bar icon:
            this._tray = new Tray(__dirname + '/iconTemplate.png');
            this._tray.setContextMenu(this.menu);
        }

        /*
         * Add items to the context menu.
        */

    }, {
        key: 'addToMenu',
        value: function addToMenu(namespace, items) {
            this.on('ready', function () {
                this.menu.append(new MenuItem({ type: 'separator' }));

                var subMenu = new Menu();

                items.forEach(function (item) {
                    var menuItem = new MenuItem(item);
                    subMenu.append(menuItem);
                });

                this.menu.append(new MenuItem({ label: namespace, submenu: subMenu }));

                // Refresh the menu:
                this._tray.setContextMenu(this.menu);
            }.bind(this));
        }
    }]);

    return Ubershit;
}();

;

window.ubershit = new Ubershit();
'use strict';

function triggerReady() {
    ubershit.trigger('ready');
};
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('nodobjc');
var ffi = require('ffi');
var path = require('path');

/* Blur Class */

var Blur = function Blur(el) {
    var blurAmt = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

    _classCallCheck(this, Blur);

    this._target = el;
    this._blurAmt = blurAmt * 2;
    this._wallPaper = this._getwallPaper();
    this._watchwallPaper();
    this._outputCanvas();
};

;

/* Blur prototype */
var proto = Blur.prototype;

/*
 * Gets the current desktop walllpaper.
 *
 * @return {string} wallPaper - the wallPaper URL
*/
proto._getwallPaper = function () {
    var output = String($.NSWorkspace('sharedWorkspace')('desktopImageURLForScreen', $.NSScreen('mainScreen'))).replace(/^file\:\/\/localhost/i, '');

    return output;
};

/*
 * Redraws the <canvas> each tim the wallpaper changes.
*/
proto._watchwallPaper = function () {
    this._wallPaperWatcher = setInterval(function () {
        var newwallPaper = this._getwallPaper();

        if (newwallPaper != this._wallPaper) {
            this._wallPaper = newwallPaper;
            this._outputCanvas();
        }
    }.bind(this), 2000);
};

/*
 * Creates a <canvas> element representing the desktop with the current background image and its positioning.
 *
 * @param {function} callback
 * @return {DOM el} canvas - the <canvas> representation of the desktop.
*/
proto._createDesktopReference = function (callback) {
    // Setup:
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var ubershit = document.getElementById('ubershit');
    var img = document.createElement('img');
    img.onload = function () {
        var screenDimensions = ubershit.getBoundingClientRect();
        var imgDimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight
        };

        // Do some calculations:
        var imgRatio = imgDimensions.width / imgDimensions.height;
        var screenRatio = screenDimensions.width / screenDimensions.height;
        var scaleAxis = imgRatio > screenRatio ? 'width' : 'height';
        var oppAxis = scaleAxis == 'width' ? 'height' : 'width';
        var newScaledAxis = imgDimensions[scaleAxis] * (screenDimensions[oppAxis] / imgDimensions[oppAxis]);
        var newNonScaledAxis = screenDimensions[oppAxis];
        var offset = (newScaledAxis - screenDimensions[scaleAxis]) / 2;
        var newWidth = scaleAxis == 'width' ? newScaledAxis : newNonScaledAxis;
        var newHeight = scaleAxis == 'height' ? newScaledAxis : newNonScaledAxis;
        var offsetX = scaleAxis == 'width' ? offset * -1 : 0;
        var offsetY = scaleAxis == 'height' ? offset * -1 : 0;

        // Do the deed:
        canvas.width = screenDimensions.width;
        canvas.height = screenDimensions.height;
        ctx.drawImage(img, 0, 0, imgDimensions.width, imgDimensions.height, offsetX, offsetY, newWidth, newHeight);
        callback(canvas);
    };
    img.src = this._wallPaper;
};

/*
 * Creates a <canvas> element representing the portion of the desktop behind the target element.
 *
 * @param {DOM el} reference - the full representation of the desktop to slice from.
 * @return {DOM el} canvas - the <canvas> representation of the desktop.
*/
proto._createOutputCanvas = function (reference) {
    var dimensions = this._target.getBoundingClientRect();

    if (this._ctx) {
        this._canvas.classList.add('hidden');
        this._ctx.clearRect(0, 0, dimensions.width + this._blurAmt, dimensions.height + this._blurAmt);
        this._ctx.drawImage(reference, dimensions.left, dimensions.top, reference.width + this._blurAmt, reference.height + this._blurAmt, 0, 0, reference.width, reference.height);
        setTimeout(function () {
            this._canvas.classList.remove('hidden');
        }.bind(this), 750);
        return;
    }

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    // @TODO:
    // * canvas drawing area isn't right on the x-axis, too small
    // * aligment is slightly off, perhaps bc of ^
    // canvas.style.backgroundColor = 'red';
    canvas.width = dimensions.width + this._blurAmt;
    canvas.height = dimensions.height + this._blurAmt;
    canvas.classList.add('ubershit-blur');
    canvas.style.top = this._blurAmt / 2 * -1 + 'px';
    canvas.style.left = this._blurAmt / 2 * -1 + 'px';
    canvas.style.webkitFilter = 'blur( ' + this._blurAmt / 2 + 'px )';
    ctx.drawImage(reference, dimensions.left, dimensions.top, reference.width, reference.height, 0, 0, reference.width + this._blurAmt * 4, reference.height + this._blurAmt * 4);

    return canvas;
};

/*
 * Adds the <canvas> to the DOM.
*/
proto._outputCanvas = function () {
    this._createDesktopReference(function (canvas) {
        var slice = this._createOutputCanvas(canvas);

        // Don't output <canvas> again if it already exists:
        if (this._ctx) {
            return;
        }

        var targetPositioning = this._target.style.position;

        if (targetPositioning == 'static') {
            this._target.style.position = 'relative';
        }

        slice.classList.add('hidden');
        this._target.appendChild(slice);
        setTimeout(function () {
            slice.classList.remove('hidden');
        }.bind(this), 350);
        this._canvas = slice;
        this._ctx = slice.getContext('2d');
    }.bind(this));
};

$.framework('cocoa');

window.Blur = Blur;
'use strict';

var osascript = require('osascript');
var exec = require('child_process').exec;
var fs = require('fs');

var commands = {};
var execs = {};

window.command = function (file, callback, interval, options) {
    options = options || {};

    if (commands.hasOwnProperty(file)) {
        clearInterval(commands[file]);
    }

    commands[file] = setInterval(function () {
        osascript.file(file, options, callback);
    }, interval);
};

window.execFromFile = function (file, callback, interval) {
    if (execs.hasOwnProperty(file)) {
        clearInterval(execs[file]);
    }

    execs[file] = setInterval(function () {
        return exec(fs.readFileSync(file), callback);
    }, interval);
};

window.WIDGET_DIR = __dirname.split('/');
window.WIDGET_DIR.splice(-1, 1);
window.WIDGET_DIR = WIDGET_DIR.join('/') + '/widgets';