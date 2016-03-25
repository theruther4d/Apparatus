'use strict';

/** A class for listening and responding to events. */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Events = function () {
    function Events() {
        _classCallCheck(this, Events);

        this._events = {};
    }

    /**
     * Check if this instance contains an event by name.
     *
     * @param {string} eventName
     */


    _createClass(Events, [{
        key: '_hasEvent',
        value: function _hasEvent(eventName) {
            return this._events.hasOwnProperty(eventName);
        }

        /*
         * Does the actual event attaching for .on()
         *
         * @param {string} eventName - a single event.
         * @param {function} callBack
         */

    }, {
        key: '_attachEvent',
        value: function _attachEvent(eventName, callBack) {
            if (!this._hasEvent(eventName)) {
                this._events[eventName] = [callBack];
                return;
            }

            this._events[eventName].push(callBack);
        }

        /**
        * Bind an event by name:
        *
        * @param {string} eventName - a single event, or multiple events separated by spaces \n.
        * @param {function} callBack
        */

    }, {
        key: 'on',
        value: function on(eventName, callBack) {
            if (eventName.indexOf(' ') > -1) {
                eventName.split(' ').forEach(function (name) {
                    this._attachEvent(name, callBack);
                }.bind(this));
            } else {
                this._attachEvent(eventName, callBack);
            }
        }

        /**
        * Trigger the event by name:
        *
        * @param {string} eventName
        */

    }, {
        key: 'trigger',
        value: function trigger(eventName) {
            if (!this._hasEvent(eventName)) {
                return false;
            }

            this._events[eventName].forEach(function (callBack) {
                callBack(eventName);
            });
        }
    }]);

    return Events;
}();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Preference Class. Manages a persistent user preferences kept in local storage.
 *
 * @param {string} name - The identifier for the preference.
 * @param {any} value - The default value. If a previously set value is found in storage, that will be used.
 * @param {function} callBack - Triggers when the value changes.
 */

var Preference = function (_Events) {
    _inherits(Preference, _Events);

    function Preference(name, value, callBack) {
        var persistent = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

        _classCallCheck(this, Preference);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Preference).call(this));

        _this._name = name;
        _this._callBack = callBack;
        _this._persistent = persistent;

        // Check if we're already set in localStorage:
        var previousValue = localStorage.getItem(_this._name);
        if (!_this._persistent) {
            _this.value = value;
            _this._tmpVal = '' + value;
        } else if (previousValue === null && (typeof previousValue === 'undefined' ? 'undefined' : _typeof(previousValue)) === 'object') {
            // set it up:
            _this.value = value;
        } else {
            // Use what's already there:
            _this.value = previousValue;
        }

        // Let everybody know when we change:
        _this.on('valueChanged', function () {
            var newValue = this._persistent ? this.value : this._tmpVal;
            this._callBack(newValue);
        }.bind(_this));
        return _this;
    }

    /**
     * Getter for value.
     */


    _createClass(Preference, [{
        key: 'value',
        get: function get() {
            if (!this._persistent) {
                return '' + this._tmpVal; // force it to be a string to match localStorage
            }

            return localStorage.getItem(this._name);
        }

        /**
         * Setter for value.
         *
         * @param {any} newValue
         */
        ,
        set: function set(newValue) {
            if (!this._persistent) {
                if (newValue === this._tmpVal) {
                    return '' + this._tmpVal; // force it to be a string to match localStorage
                }

                this._tmpVal = '' + newValue;
                this.trigger('valueChanged');
                return '' + this._tmpVal;
            }

            if (newValue === this._value) {
                return this._value;
            }

            localStorage.setItem(this._name, newValue);
            this.trigger('valueChanged');
        }
    }]);

    return Preference;
}(Events);

;
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var electron = require('electron');
var remote = electron.remote;
var app = remote.app;
var Tray = remote.Tray;
var shell = remote.shell;
var Menu = remote.Menu;
var MenuItem = remote.MenuItem;
var browserWindow = remote.BrowserWindow;
var osascript = require('osascript');
var _exec = require('child_process').exec;
var fs = require('fs');
var $ = require('nodobjc');
var ffi = require('ffi');

/** Ubershit Class */

var Ubershit = function (_Events) {
    _inherits(Ubershit, _Events);

    function Ubershit() {
        _classCallCheck(this, Ubershit);

        // Some helpful things:
        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Ubershit).call(this));
        // Setup:

        _this.WIDGET_DIR = _this._getWidgetDirPath();
        _this.OUTPUT_DIR = _this._getOuputDirPath();
        _this._commands = {};
        _this._execs = {};
        _this._blurs = [];

        // Setup our blur visibility preference:
        _this._blursVisible = new Preference('blursVisible', true, function (newValue) {
            var action = newValue === 'true' ? '_showBlurs' : '_hideBlurs';
            this[action]();
        }.bind(_this));

        // Handles setup for the first load:
        _this.on('ready', function () {
            this._createTray();
            this.browserWindow = browserWindow.getAllWindows()[0];
        }.bind(_this));

        // Tear down our menu/tray when we're going to reload:
        _this.on('willReload', function () {
            if (this._tray) {
                this._tray.destroy();
                this._tray = null;
            }

            this.browserWindow = null;
            this.menu = null;
        }.bind(_this));

        // Rebuild menu/tray when we're done reloading:
        _this.on('didReload', function () {
            this._createTray();
            this.browserWindow = browserWindow.getAllWindows()[0];

            // Let the widgets know we've changed the menu:
            this.trigger('menuChanged');
        }.bind(_this));

        _this.on('ready didReload', function () {
            // Setup our temporary preference for showing devTools:
            this._devToolsVisible = new Preference('devToolsVisible', false, function (newValue) {
                var action = newValue === 'true' ? 'openDevTools' : 'closeDevTools';

                this.browserWindow.webContents[action]({
                    detach: true
                });
            }.bind(this), false);
        }.bind(_this));
        return _this;
    }

    /**
     * Returns the widget directory path.
     */


    _createClass(Ubershit, [{
        key: '_getWidgetDirPath',
        value: function _getWidgetDirPath() {
            var WIDGET_DIR = __dirname.split('/');
            WIDGET_DIR.splice(-1, 1);
            WIDGET_DIR = WIDGET_DIR.join('/') + '/widgets';
            return WIDGET_DIR;
        }

        /**
         * Returns the output directory path.
         */

    }, {
        key: '_getOuputDirPath',
        value: function _getOuputDirPath() {
            var OUTPUT_DIR = __dirname.split('/');
            OUTPUT_DIR.splice(-1, 1);
            OUTPUT_DIR = OUTPUT_DIR.join('/') + '/dist';
            return OUTPUT_DIR;
        }

        /**
         * Creates the tray icon and initial context menu.
         */

    }, {
        key: '_createTray',
        value: function _createTray() {
            var _this2 = this;

            this._tray = new Tray(__dirname + '/iconTemplate.png');

            // Menu:
            this.menu = Menu.buildFromTemplate([{
                label: 'Open Widgets Folder',
                type: 'normal',
                click: function click(item) {
                    shell.showItemInFolder(_this2.WIDGET_DIR);
                }
            }, {
                label: 'Show Debug Console',
                type: 'checkbox',
                checked: this._devToolsVisible === 'true',
                click: function click(item) {
                    _this2._devToolsVisible.value = item.checked;
                }
            }, {
                label: 'Hide blur effect.',
                type: 'checkbox',
                checked: this._blursVisible.value === 'false',
                click: function click(item) {
                    _this2._blursVisible.value = !item.checked;
                    var classAction = item.checked ? 'add' : 'remove';
                    document.documentElement.classList[classAction]('no-blur');
                }
            }, {
                type: 'separator',
                id: 'separator'
            }, {
                label: 'Quit Ubershit',
                type: 'normal',
                accelerator: 'Command+Q',
                click: function click(item) {
                    app.quit();
                }
            }]);

            // Create the notification bar icon:
            this._tray.setContextMenu(this.menu);
        }

        /**
         * Add items to the context menu.
         */

    }, {
        key: 'addToMenu',
        value: function addToMenu(namespace, items) {
            this.on('ready menuChanged', function (e) {
                var subMenu = new Menu();

                items.forEach(function (item) {
                    var menuItem = new MenuItem(item);
                    subMenu.append(menuItem);
                });

                this.menu.insert(3, new MenuItem({ type: 'separator' }));
                this.menu.insert(4, new MenuItem({ label: namespace, submenu: subMenu }));

                // Refresh the menu:
                this._tray.setContextMenu(this.menu);
            }.bind(this));
        }

        /**
         * A wrapper around osascript, executes the file at a given interval.
         *
         * @param {string} file - The file to execute. Must be valid osascript.
         * @param {function} callback - Executed after the file command, returns with params error, and response.
         * @param {integer} interval - The interval at which to re-execute the command.
         * @param {object} options - Options for npm osascript module.
         */

    }, {
        key: 'command',
        value: function command(file, callback, interval, options) {
            options = options || {};

            if (this._commands.hasOwnProperty(file)) {
                clearInterval(this._commands[file]);
            }

            this._commands[file] = setInterval(function () {
                osascript.file(file, options, callback);
            }, interval);
        }

        /**
         * Executes a script from a file at a specific interval.
         *
         * @param {string} file - The file to execute. Must be valid osascript.
         * @param {function} callback - Executed after the file command, returns with params error, and response.
         * @param {integer} interval - The interval at which to re-execute the command.
         */

    }, {
        key: 'execFromFile',
        value: function execFromFile(file, callback, interval) {
            if (this._execs.hasOwnProperty(file)) {
                clearInterval(this._execs[file]);
            }

            this._execs[file] = setInterval(function () {
                return _exec(fs.readFileSync(file), callback);
            }, interval);
        }

        /**
         * Executes a shell script.
         *
         * @param {string} command
         * @param {function} options
         * @param {integer} callback
         */

    }, {
        key: 'exec',
        value: function exec(command, options, callback) {
            _exec(command, options, callback);
        }

        /*
         * Gets the current desktop walllpaper.
         *
         * @return {string} wallPaper - the wallPaper URL
         */

    }, {
        key: '_getwallPaper',
        value: function _getwallPaper() {
            var output = String($.NSWorkspace('sharedWorkspace')('desktopImageURLForScreen', $.NSScreen('mainScreen'))).replace(/^file\:\/\/localhost/i, '');

            return output;
        }

        /*
         * Watches the desktop for background changes.
         */

    }, {
        key: '_watchwallPaper',
        value: function _watchwallPaper() {
            return setInterval(function () {
                var newwallPaper = this._getwallPaper();

                if (newwallPaper != this._wallPaper) {
                    this._wallPaper = newwallPaper;
                    this._updateBlurs(this._wallPaper);
                }
            }.bind(this), 2000);
        }

        /**
         * Makes Blur Class publicly available.
         */

    }, {
        key: 'blur',
        value: function blur(el) {
            var blurAmt = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

            this._wallPaper = this._wallPaper || this._getwallPaper();
            this._wallPaperWatcher = this._wallPaperWatcher || this._watchwallPaper();

            var newBlur = new Blur(el, blurAmt, this._wallPaper, this._blursVisible.value === 'true');
            this._blurs.push(newBlur);
            return newBlur;
        }

        /**
         * Updates all active blurs.
         *
         * @param {string} wallpaper - the wallpaper url
         */

    }, {
        key: '_updateBlurs',
        value: function _updateBlurs(wallPaper) {
            this._blurs.forEach(function (blur) {
                blur.update(wallPaper);
            });
        }

        /**
         * Hides all blur instances.
         */

    }, {
        key: '_hideBlurs',
        value: function _hideBlurs() {
            this._blurs.forEach(function (blur) {
                blur.hide();
            });
        }

        /**
         * Shows all blur instances.
         */

    }, {
        key: '_showBlurs',
        value: function _showBlurs() {
            this._blurs.forEach(function (blur) {
                blur.show();
            });
        }
    }]);

    return Ubershit;
}(Events);

;

window.ubershit = new Ubershit();

$.framework('cocoa');
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Blur Class */

var Blur = function Blur(el) {
    var blurAmt = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];
    var wallPaper = arguments[2];
    var inject = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

    _classCallCheck(this, Blur);

    this._target = el;
    this._blurAmt = blurAmt * 2;
    this._visible = inject;
    this._outputCanvas(wallPaper, inject);
};

;

/* Blur prototype */
var proto = Blur.prototype;

/*
 * Creates a <canvas> element representing the desktop with the current background image and its positioning.
 *
 * @param {function} callback
 * @return {DOM el} canvas - the <canvas> representation of the desktop.
*/
proto._createDesktopReference = function (wallPaper, callback) {
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
    img.src = wallPaper;
};

/**
 * Handles fading in the <canvas> after it's been redraws.
*/
proto._switchTransition = function (e) {
    this._ctx.clearRect(0, 0, this._dimensions.width + this._blurAmt, this._dimensions.height + this._blurAmt);
    this._ctx.drawImage(this._reference, this._dimensions.left - 8, this._dimensions.top - 32, this._reference.width + this._blurAmt, this._reference.height + this._blurAmt, 0, 0, this._reference.width, this._reference.height);
    this._canvas.classList.remove('hidden');
    this._canvas.removeEventListener('transitionend', this._switchTransition.bind(this));
};

/**
 * Creates a <canvas> element representing the portion of the desktop behind the target element.
 *
 * @param {DOM el} reference - the full representation of the desktop to slice from.
 * @return {DOM el} canvas - the <canvas> representation of the desktop.
*/
proto._createOutputCanvas = function (reference) {
    this._dimensions = this._target.getBoundingClientRect();
    this._reference = reference;

    if (this._ctx) {
        this._canvas.addEventListener('transitionend', this._switchTransition.bind(this));
        this._canvas.classList.add('hidden');
        return;
    }

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = this._dimensions.width + this._blurAmt;
    canvas.height = this._dimensions.height + this._blurAmt;
    canvas.classList.add('ubershit-blur');
    canvas.style.top = this._blurAmt / 2 * -1 + 'px';
    canvas.style.left = this._blurAmt / 2 * -1 + 'px';
    canvas.style.webkitFilter = 'blur( ' + this._blurAmt / 2 + 'px )';
    canvas.style.transform = 'translateZ( 0 )';
    ctx.drawImage(this._reference, this._dimensions.left - 8, this._dimensions.top - 32, this._reference.width, this._reference.height, 0, 0, this._reference.width + this._blurAmt * 2, this._reference.height + this._blurAmt * 2);

    return canvas;
};

/*
 * Adds the <canvas> to the DOM.
*/
proto._outputCanvas = function (wallPaper, inject) {
    this._createDesktopReference(wallPaper, function (canvas) {
        var slice = this._createOutputCanvas(canvas);

        // Don't output <canvas> again if it already exists:
        if (this._ctx) {
            return;
        }

        var targetPositioning = this._target.style.position;

        if (targetPositioning == 'static') {
            this._target.style.position = 'relative';
        }

        this._canvas = slice;
        this._ctx = slice.getContext('2d');

        if (inject) {
            this.show();
        }
    }.bind(this));
};

proto.hide = function () {
    if (this._visible) {
        this._target.removeChild(this._canvas);
        this._visible = false;
    }
};

proto.show = function () {
    this._canvas.classList.add('hidden');
    this._target.appendChild(this._canvas);
    this._canvas.classList.remove('hidden');
    this._visible = true;
};

proto.update = function (wallPaper) {
    this._outputCanvas(wallPaper);
};

window.Blur = Blur;