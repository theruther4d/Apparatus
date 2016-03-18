'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('nodobjc');
var ffi = require('ffi');
var path = require('path');

// @TODO:
// * need to account for the dock height

/* Blur Class */

var Blur = function Blur(el) {
    _classCallCheck(this, Blur);

    this._target = el;
    this._wallPaper = this._getwallPaper();
    this._watchwallPaper();
    this._outputCanvas();
};

;

/* BlurBg prototype */
var proto = Blur.prototype;

/*
 * Gets the current desktop walllpaper.
 *
 * @return {string} wallPaper - the wallPaper URL
*/
proto._getwallPaper = function () {
    // if( !this._wallPaperWatcher ) {
    //     this._watchwallPaper();
    // }

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
        this._ctx.clearRect(0, 0, dimensions.width + 20, dimensions.height + 20);
        this._ctx.drawImage(reference, dimensions.left, dimensions.top, reference.width + 20, reference.height + 20, 0, 0, reference.width, reference.height);
        setTimeout(function () {
            this._canvas.classList.remove('hidden');
        }.bind(this), 750);
        return;
    }

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = dimensions.width + 20;
    canvas.height = dimensions.height + 20;
    canvas.classList.add('ubershit-blur');
    ctx.drawImage(reference, dimensions.left, dimensions.top, reference.width + 20, reference.height + 20, 0, 0, reference.width, reference.height);

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

        this._target.appendChild(slice);
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