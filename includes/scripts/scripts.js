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
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('nodobjc');
var ffi = require('ffi');
var path = require('path');

var BlurBg = function BlurBg() {
    _classCallCheck(this, BlurBg);

    $.framework('cocoa');
};

;

var proto = BlurBg.prototype;

proto._getWallPaper = function () {
    return String($.NSWorkspace('sharedWorkspace')('desktopImageURLForScreen', $.NSScreen('mainScreen'))).replace(/^file\:\/\/localhost/i, '');
};

proto._createDesktopMockup = function () {};

// const bg = getBackground();
var bgImage = document.createElement('img');
bgImage.src = getBackground();
bgImage.classList.add('bgImage');
document.getElementById('ubershit').appendChild(bgImage);

var doBgBlur = function doBgBlur() {
    // Setup:
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var ubershit = document.getElementById('ubershit');
    var img = document.querySelector('.bgImage');
    var wrapper = document.querySelector('.playbox__wrapper');
    var screenDimensions = ubershit.getBoundingClientRect();
    var imgDimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
    };
    var dimensions = wrapper.getBoundingClientRect();

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

    var canvas2 = document.createElement('canvas');
    var ctxTwo = canvas2.getContext('2d');

    canvas2.width = dimensions.width;
    canvas2.height = dimensions.height;

    // Something with the width/height is too small!!!
    console.log('output width: ' + dimensions.width);
    console.log('output height: ' + dimensions.height);
    ctxTwo.drawImage(canvas, dimensions.left, dimensions.top, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    canvas2.id = 'bozo';
    wrapper.appendChild(canvas2);
};