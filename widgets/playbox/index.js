// For storing state:
let lastTrackId, lastArtist, lastSong, lastAlbum, lastRating, lastDuration, lastPosition;

// DOM nodes:
let progressBarEl = document.querySelector( '.playbox__progress' );
let artistEl = document.querySelector( '.playbox__meta__artist' );
let songEl = document.querySelector( '.playbox__meta__song' );
let albumEl = document.querySelector( '.playbox__meta__album' );

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

command( `/Users/josruthe/ubershit/widgets/playbox/getTrack.applescript`, ( err, res ) => {
    let track = res.split( '~' );
    let trackId = track.slice( 0, 2 ).join( '' );
    let artist, song, album, rating, duration;

    // Always update position:
    let position = track[5];

    // Find out if we've changed songs:
    const hasChanged = trackId !== lastTrackId;

    // Don't do work unless things have changed:
    if( hasChanged ) {
        [artist, song, album, rating, duration, position] = track;

        updateProgress( duration, position );
        updateTrack( artist, song, album );

        // Update our cached values:
        [lastTrackId, lastArtist, lastSong, lastAlbum, lastRating, lastDuration, lastPosition] = [trackId, artist, song, album, rating, duration, position];
    } else {
        updateProgress( lastDuration, position );
    }

}, 1000 );
