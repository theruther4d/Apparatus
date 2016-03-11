'use strict';
// import osascript from 'osascript';
// import childProcess from 'child_process';
// import fs from 'fs';

var osascript = require('osascript');
var exec = require('child_process').exec;
var fs = require('fs');

// const exec = childProcess.exec;

var commands = {};
var execs = {};

window.command = function (file, callback, interval) {
    if (commands.hasOwnProperty(file)) {
        clearInterval(commands[file]);
    }

    commands[file] = setInterval(function () {
        osascript.file(file, callback);
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

module.exports = command;
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var command = require('../internal/scripts/command.js');

// For storing state:
var lastTrackId = void 0,
    lastArtist = void 0,
    lastSong = void 0,
    lastAlbum = void 0,
    lastRating = void 0,
    lastDuration = void 0,
    lastPosition = void 0,
    lastArtwork = void 0;

// DOM nodes:
var progressBarEl = document.querySelector('.playbox__progress');
var artistEl = document.querySelector('.playbox__meta__artist');
var songEl = document.querySelector('.playbox__meta__song');
var albumEl = document.querySelector('.playbox__meta__album');
var artEl = document.querySelector('.playbox__art');

var transitionMode = false;
var step1 = null;
var step2 = null;

function updateProgress(duration, position) {
    position = +position * 1000;
    duration = +duration;
    var progress = (position / duration * 100).toFixed(2);

    progressBarEl.style.backgroundSize = progress + '% 100%';
};

function updateTrack(artist, song, album) {
    artistEl.textContent = artist;
    songEl.textContent = song;
    albumEl.textContent = album;
};

function updateArtwork(artwork) {
    var step1Func = function step1Func() {
        console.log('1');
        artEl.classList.remove('transitioning');
        artEl.classList.add('transitioned');
    };

    var step2Func = function step2Func() {
        console.log('2');
        artEl.classList.remove(transitionTo);
        artEl.classList.remove('will-transition');
        artEl.classList.remove('transitioned');
    };

    transitionMode = !transitionMode;
    if (step1) {
        console.log('clearing step1');
        clearTimeout(step1);
        // step1Func();
    }

    if (step2) {
        console.log('clearing step2');
        clearTimeout(step2);
        // step2Func();
    }

    var art1 = artEl.querySelector('.playbox__art__image.top');
    var art2 = artEl.querySelector('.playbox__art__image.bottom');
    var transitionTo = transitionMode ? 'fade-out' : 'fade-in';

    artEl.classList.add('will-transition');
    artEl.classList.add(transitionTo);

    if (transitionMode) {
        art2.setAttribute('src', artwork);
    } else {
        art1.setAttribute('src', artwork);
    }

    art2.onload = function () {
        artEl.classList.add('transitioning');

        step1 = setTimeout(step1Func, 250);

        step2 = setTimeout(step2Func, 500);
    };
};

execFromFile('/Users/josruthe/ubershit/widgets/playbox/playbox.sh', function (err, res) {
    var track = res.split('~');
    var trackId = track.slice(0, 2).join('');
    var artist = void 0,
        song = void 0,
        album = void 0,
        rating = void 0,
        duration = void 0,
        position = void 0,
        playlist = void 0,
        artwork = void 0;

    // Find out if we've changed songs:
    var hasChanged = trackId !== lastTrackId;

    // Don't do work unless things have changed:
    if (hasChanged) {
        var _track = _slicedToArray(track, 8);

        artist = _track[0];
        song = _track[1];
        album = _track[2];
        rating = _track[3];
        duration = _track[4];
        position = _track[5];
        playlist = _track[6];
        artwork = _track[7];


        updateProgress(duration, position);
        updateTrack(artist, song, album);
        updateArtwork(artwork);

        // Update our cached values:
        lastTrackId = trackId;
        lastArtist = artist;
        lastSong = song;
        lastAlbum = album;
        lastRating = rating;
        lastDuration = duration;
        lastPosition = position;
    } else {
        // Always update position:
        position = track[5];
        updateProgress(lastDuration, position);
    }
}, 1000);