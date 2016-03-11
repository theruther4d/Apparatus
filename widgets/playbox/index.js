'use strict';

const command = require( '../internal/scripts/command.js' );

// For storing state:
let lastTrackId, lastArtist, lastSong, lastAlbum, lastRating, lastDuration, lastPosition, lastArtwork;

// DOM nodes:
let progressBarEl = document.querySelector( '.playbox__progress' );
let artistEl = document.querySelector( '.playbox__meta__artist' );
let songEl = document.querySelector( '.playbox__meta__song' );
let albumEl = document.querySelector( '.playbox__meta__album' );
let artEl = document.querySelector( '.playbox__art' );

let transitionMode = false;
var step1 = null;
var step2 = null;

function updateProgress( duration, position ) {
    position = +position * 1000;
    duration = +duration;
    const progress = ( ( position / duration ) * 100 ).toFixed( 2 );

    progressBarEl.style.backgroundSize = `${progress}% 100%`;
};

function updateTrack( artist, song, album ) {
    artistEl.textContent = artist;
    songEl.textContent = song;
    albumEl.textContent = album;
};

function updateArtwork( artwork ) {
    let step1Func = () => {
        console.log( '1' );
        artEl.classList.remove( 'transitioning' );
        artEl.classList.add( 'transitioned' );
    };

    let step2Func = () => {
        console.log( '2' );
        artEl.classList.remove( transitionTo );
        artEl.classList.remove( 'will-transition' );
        artEl.classList.remove( 'transitioned' );
    };

    transitionMode = !transitionMode;
    if( step1 ) {
        console.log( 'clearing step1' );
        clearTimeout( step1 );
        // step1Func();
    }

    if( step2 ) {
        console.log( 'clearing step2' );
        clearTimeout( step2 );
        // step2Func();
    }


    const art1 = artEl.querySelector( '.playbox__art__image.top' );
    const art2 = artEl.querySelector( '.playbox__art__image.bottom' );
    const transitionTo = transitionMode ? 'fade-out' : 'fade-in';


    artEl.classList.add( 'will-transition' );
    artEl.classList.add( transitionTo );

    if( transitionMode ) {
        art2.setAttribute( 'src', artwork );
    } else {
        art1.setAttribute( 'src', artwork );
    }

    art2.onload = () => {
        artEl.classList.add( 'transitioning' );

        step1 = setTimeout( step1Func, 250 );

        step2 = setTimeout( step2Func, 500 );
    };
};

execFromFile( '/Users/josruthe/ubershit/widgets/playbox/playbox.sh', ( err, res ) => {
    let track = res.split( '~' );
    let trackId = track.slice( 0, 2 ).join( '' );
    let artist, song, album, rating, duration, position, playlist, artwork;

    // Find out if we've changed songs:
    const hasChanged = trackId !== lastTrackId;

    // Don't do work unless things have changed:
    if( hasChanged ) {
        [artist, song, album, rating, duration, position, playlist, artwork] = track;

        updateProgress( duration, position );
        updateTrack( artist, song, album );
        updateArtwork( artwork );

        // Update our cached values:
        [lastTrackId, lastArtist, lastSong, lastAlbum, lastRating, lastDuration, lastPosition] = [trackId, artist, song, album, rating, duration, position];
    } else {
        // Always update position:
        position = track[5];
        updateProgress( lastDuration, position );
    }
}, 1000 );
