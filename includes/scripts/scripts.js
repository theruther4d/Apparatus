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